import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class CertChangeDetails extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals

    return {
      ...super.locals(req, res),
      removeHeadingSpacing: true,
      titleCaption: capFirst(decoratedLocation.displayName),
      cancelLink: `/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`,
    }
  }
}
