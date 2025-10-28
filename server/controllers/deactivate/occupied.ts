import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class DeactivateTemporaryOccupied extends FormInitialStep {
  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      title: "You can't deactivate this location as it is currently occupied",
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
