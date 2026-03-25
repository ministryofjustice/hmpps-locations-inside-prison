// eslint-disable-next-line max-classes-per-file
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import CommonTransaction from '../commonTransaction'
import steps from './steps'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'

class ExtendedTransaction extends CommonTransaction {
  override getSteps({
    next,
    title,
    caption,
  }: {
    next: FormWizard.Step['next']
    title?: (req: FormWizard.Request, res: Response) => string
    caption?: (req: FormWizard.Request, res: Response) => string
  }) {
    const modifiedSteps = super.getSteps({ next })

    // Avoid modifying the original step object, to protect against unintended changes occurring
    modifiedSteps[`${this.pathPrefix}/`] = {
      ...modifiedSteps[`${this.pathPrefix}/`],
      controller: class extends FormInitialStep {
        override locals(req: FormWizard.Request, res: Response): TypedLocals {
          const locals = super.locals(req, res)

          if (title) {
            locals.title = res.locals.title.replace('This', title(req, res))
          }
          if (caption) {
            locals.titleCaption = caption(req, res)
          }

          return locals
        }
      },
    }

    return modifiedSteps
  }
}

const CertChangeDisclaimer = new ExtendedTransaction({
  steps,
  pathPrefix: '/cert-change-disclaimer',
})
export default CertChangeDisclaimer
