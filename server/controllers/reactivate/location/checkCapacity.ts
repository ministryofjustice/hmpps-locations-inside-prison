import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import capFirst from '../../../formatters/capFirst'
import unsetTempValues from '../../../middleware/unsetTempValues'
import applyChangesToLocationTree from './middleware/applyChangesToLocationTree'

export default class CheckCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(unsetTempValues)
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(applyChangesToLocationTree)
    this.use(this.resetErrors)
  }

  resetErrors(req: FormWizard.Request, _res: Response, next: NextFunction) {
    req.sessionModel.unset('errorValues')

    const errors: Record<string, FormWizard.Controller.Error> = req.sessionModel.get('errors')
    if (errors) {
      Object.keys(errors).forEach(key => {
        if (key.startsWith('workingCapacity') || key.startsWith('maximumCapacity') || key.startsWith('baselineCna')) {
          delete errors[key]
        }
      })
      req.sessionModel.set('errors', errors)
    }

    next()
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
