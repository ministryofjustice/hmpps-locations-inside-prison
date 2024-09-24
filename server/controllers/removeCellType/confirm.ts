import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../utils/backUrl'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getResidentialSummary from '../../middleware/getResidentialSummary'

export default class ConfirmRemoveCellType extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummary)
  }

  locals(req: FormWizard.Request, res: Response): object {
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const { maxCapacity, workingCapacity } = location.capacity

    const newWorkingCap = Number(req.sessionModel.get('workingCapacity'))
    const newMaxCap = Number(req.sessionModel.get('maxCapacity'))
    const { residentialSummary } = res.locals

    const changeSummaries = compact([
      generateChangeSummary(
        'working capacity',
        workingCapacity,
        newWorkingCap,
        residentialSummary.prisonSummary.workingCapacity,
      ),
      generateChangeSummary('maximum capacity', maxCapacity, newMaxCap, residentialSummary.prisonSummary.maxCapacity),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    const backLink = backUrl(req, { fallbackUrl: `/location/${location.id}/remove-cell-type/review` })

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services

      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.updateCapacity(
        token,
        res.locals.location.id,
        Number(req.sessionModel.get('maxCapacity')),
        Number(req.sessionModel.get('workingCapacity')),
      )

      await locationsService.updateSpecialistCellTypes(token, res.locals.location.id, [])

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.location

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell updated',
      content: 'You have removed the cell type and updated the capacity for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
