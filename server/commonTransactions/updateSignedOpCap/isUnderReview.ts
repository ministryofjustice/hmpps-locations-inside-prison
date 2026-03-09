import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import BaseController from './baseController'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class IsUnderReview extends BaseController {

  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    locals.prisonResidentialSummary = res.locals.prisonResidentialSummary

    return {
      ...locals,
      titleCaption: `${capFirst(res.locals.prisonResidentialSummary.prisonSummary.prisonName)}`,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { values } = req.form

    req.sessionModel.set('proposedSignedOpCapChange', {
      prisonId: res.locals.prisonId,
      signedOperationalCapacity: Number(values['update-signed-op-cap_newSignedOpCap']),
      reasonForChange: values['update-signed-op-cap_explanation'],
    })

    super.saveValues(req, res, next)
  }
}
