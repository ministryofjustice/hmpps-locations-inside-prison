import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'

export default class TooManyOccupants extends FormInitialStep {
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService } = req.services
    const { systemToken } = req.session
    const { approvalRequest, prisonId } = res.locals

    const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)

    res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    res.locals.backLink = `/${prisonId}/cell-certificate/change-requests/${approvalRequest.id}/review`

    await super._locals(req, res, next)
  }
}
