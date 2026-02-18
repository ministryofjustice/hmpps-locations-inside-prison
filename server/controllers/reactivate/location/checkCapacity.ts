import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import capFirst from '../../../formatters/capFirst'

export default class CheckCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
    this.use(addConstantToLocals('specialistCellTypes'))
  }

  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(_req, res)
    const { decoratedLocation } = res.locals

    return {
      ...locals,
      title: `Check capacity of cell${decoratedLocation.leafLevel ? '' : 's'}`,
      titleCaption: capFirst(decoratedLocation.displayName),
      minLayout: 'three-quarters',
    }
  }
}
