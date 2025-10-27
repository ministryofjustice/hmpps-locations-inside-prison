import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class DeactivateType extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
      title: 'Do you want to deactivate this location temporarily or permanently?',
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
