import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class CertChangeDisclaimerController extends FormInitialStep {
  private static title: (req: FormWizard.Request, res: Response) => string

  private static caption: (req: FormWizard.Request, res: Response) => string

  private static description: (req: FormWizard.Request, res: Response) => string

  static setData({
    title,
    caption,
    description,
  }: {
    title?: (req: FormWizard.Request, res: Response) => string
    caption?: (req: FormWizard.Request, res: Response) => string
    description?: (req: FormWizard.Request, res: Response) => string
  }) {
    this.title = title
    this.caption = caption
    this.description = description
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)

    if (CertChangeDisclaimerController.title) {
      locals.title = res.locals.title.replace('This', CertChangeDisclaimerController.title(req, res))
    }
    if (CertChangeDisclaimerController.caption) {
      locals.titleCaption = CertChangeDisclaimerController.caption(req, res)
    }
    if (CertChangeDisclaimerController.description) {
      locals.certAction = CertChangeDisclaimerController.description(req, res)
    }

    return locals
  }
}
