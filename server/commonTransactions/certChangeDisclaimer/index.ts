import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import CommonTransaction from '../commonTransaction'
import steps from './steps'
import CertChangeDisclaimerController from './controller'

class ExtendedTransaction extends CommonTransaction {
  getSteps({
    next,
    title,
    caption,
    description,
  }: {
    next: FormWizard.Step['next']
    title?: (req: FormWizard.Request, res: Response) => string
    caption?: (req: FormWizard.Request, res: Response) => string
    description?: (req: FormWizard.Request, res: Response) => string
  }) {
    ;(this.steps[`${this.pathPrefix}/`].controller as unknown as typeof CertChangeDisclaimerController).setData({
      title,
      caption,
      description,
    })

    return super.getSteps({ next })
  }
}

const CertChangeDisclaimer = new ExtendedTransaction({
  steps,
  pathPrefix: '/cert-change-disclaimer',
})
export default CertChangeDisclaimer
