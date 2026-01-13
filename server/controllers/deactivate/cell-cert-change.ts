import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class CellCertChange extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals

    return {
      ...locals,
      title: 'Does the cell’s certified working capacity need to be decreased to 0 on the cell certificate?',
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
