import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import approvalTypeDescription from '../../../../formatters/approvalTypeDescription'
import conditionallyPopulatePrisoners from './conditionallyPopulatePrisoners'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'

export default class Review extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
    this.use(conditionallyPopulatePrisoners)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { approvalRequest, constants, location } = res.locals

    res.locals.title = `Review ${approvalTypeDescription(approvalRequest, constants, location).toLowerCase()} request`

    await super._locals(req, res, next)
  }
}
