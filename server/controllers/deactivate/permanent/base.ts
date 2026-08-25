import FormStep from '../../base/formStep'
import protectRoute from '../../../middleware/protectRoute'

export default class DeactivatePermanentBase extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(protectRoute('deactivate:permanent'))
  }
}
