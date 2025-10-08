import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import capFirst from '../../../formatters/capFirst'
import displayName from '../../../formatters/displayName'

export default class Withdraw extends FormInitialStep {
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService, manageUsersService } = req.services
    const { systemToken } = req.session
    const { approvalRequest, user } = res.locals

    if (approvalRequest.locationId) {
      const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    } else {
      res.locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
    }

    res.locals.buttonText = `Confirm withdrawal`

    res.locals.userMap = {
      [approvalRequest.requestedBy]:
        (await manageUsersService.getUser(user.token, approvalRequest.requestedBy))?.name ||
        approvalRequest.requestedBy,
    }

    res.locals.cancelText = 'Cancel'

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { explanation } = req.form.values
    const { locationsService } = req.services
    const { approvalRequest } = res.locals

    const { systemToken } = req.session
    await locationsService.withdrawCertificationRequest(systemToken, approvalRequest.id, explanation as string)

    req.journeyModel.reset()
    req.sessionModel.reset()

    let bannerLocationText: string
    const { locationId } = approvalRequest
    if (locationId) {
      const location = await locationsService.getLocation(systemToken, locationId)
      bannerLocationText = `${location.locationType.toLowerCase()} ${location.localName || location.pathHierarchy}`
    } else {
      bannerLocationText = res.locals.prisonResidentialSummary.prisonSummary.prisonName
    }

    req.flash('success', {
      title: `Change request withdrawn`,
      content: `You have withdrawn the change request for ${bannerLocationText}.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
