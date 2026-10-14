import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import limitConcurrency from '../../../utils/limitConcurrency'

// Every inactive cell on a wing can be selected at once. Requesting them all at once uses up the API's database
// connections, so the reactivation fails and every other caller of the API fails with it
const MAX_CONCURRENT_API_CALLS = 10

export default async function populateCells(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { systemToken } = req.session
  const { locationsService } = req.services
  const selectedLocations: string[] = req.sessionModel.get('selectedLocations') as string[]
  const limit = limitConcurrency(MAX_CONCURRENT_API_CALLS)

  res.locals.cells = await Promise.all(
    selectedLocations.map(id => limit(() => locationsService.getLocation(systemToken, id))),
  )

  next()
}
