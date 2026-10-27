import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import limitConcurrency from '../../../utils/limitConcurrency'

// Every inactive cell on a wing can be selected at once. Requesting them all at once uses up the API's database
// connections, so the reactivation fails and every other caller of the API fails with it
const MAX_CONCURRENT_API_CALLS = 10

export default async function populateCells(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { systemToken } = req.session
  const { locationsService } = req.services
  const { prisonId, locationId } = res.locals
  const selectedLocations: string[] = req.sessionModel.get('selectedLocations') as string[]
  const limit = limitConcurrency(MAX_CONCURRENT_API_CALLS)

  // The cells were selected from this list, so one call gets them all. A cell reactivated since then is no longer
  // in it, so look that one up on its own
  const inactiveCells = (await locationsService.getInactiveCells(systemToken, prisonId, locationId)) || []
  const inactiveCellMap = Object.fromEntries(inactiveCells.map(cell => [cell.id, cell]))

  res.locals.cells = await Promise.all(
    selectedLocations.map(id => inactiveCellMap[id] || limit(() => locationsService.getLocation(systemToken, id))),
  )

  next()
}
