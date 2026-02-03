import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import formatConstants from '../../../../formatters/formatConstants'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'

export default class Review extends FormInitialStep {
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService, manageUsersService } = req.services
    const { systemToken } = req.session
    const { approvalRequest, user } = res.locals

    res.locals.title = `Review ${formatConstants(res.locals.approvalTypeConstants, res.locals.approvalRequest.approvalType).toLowerCase()} request`

    if (approvalRequest.locationId) {
      const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    } else {
      res.locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
    }

    res.locals.userMap = {
      [approvalRequest.requestedBy]:
        (await manageUsersService.getUser(user.token, approvalRequest.requestedBy))?.name ||
        approvalRequest.requestedBy,
    }

    res.locals.cancelText = 'Cancel'

    await super._locals(req, res, next)
  }
}
