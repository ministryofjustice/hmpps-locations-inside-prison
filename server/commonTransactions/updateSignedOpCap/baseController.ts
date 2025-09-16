import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'

async function getSignedOpCapChangeRequest(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { locationsService } = req.services
  const pendingRequests = await locationsService.getCertificateApprovalRequests(
    req.session.systemToken,
    res.locals.prisonId,
  )

  res.locals.signedOpCapChangeRequest = pendingRequests.find(r => r.approvalType === 'SIGNED_OP_CAP')

  next()
}

export default class BaseController extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(getSignedOpCapChangeRequest)
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName

    return locals
  }
}
