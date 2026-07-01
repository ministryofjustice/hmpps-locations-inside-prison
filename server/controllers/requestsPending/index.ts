import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class RequestsPending extends FormInitialStep {
  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeRequestsLink: `/${prisonId}/cell-certificate/change-requests`,
      decoratedLocation,
      title: 'You can’t request a change to the certificate for this location currently',
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
