import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'
import addConstantToLocals from '../../../../middleware/addConstantToLocals'
import addUsersToUserMap from '../../../../middleware/addUsersToUserMap'
import { Location } from '../../../../data/types/locationsApi'
import approvalTypeDescription from '../../../../formatters/approvalTypeDescription'

export default class Review extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(addConstantToLocals('locationTypes'))
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService } = req.services
    const { systemToken } = req.session
    const { approvalRequest, constants, prisonResidentialSummary } = res.locals

    let location: Location
    if (approvalRequest.locationId) {
      location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    } else {
      res.locals.titleCaption = prisonResidentialSummary.prisonSummary.prisonName
    }

    res.locals.title = `Review ${approvalTypeDescription(approvalRequest.approvalType, constants, location).toLowerCase()} request`

    await addUsersToUserMap([approvalRequest.requestedBy])(req, res, null)

    if (location) {
      if (!res.locals.locationMap) {
        res.locals.locationMap = {}
      }

      res.locals.locationMap[location.id] = location
    }

    res.locals.cancelText = 'Cancel'

    await super._locals(req, res, next)
  }
}
