import CommonTransaction from '../commonTransaction'
import { steps, stepsWithCertChange } from './steps'
import fields from './fields'

export default class SetCellType extends CommonTransaction {
  constructor({ includeCertificationSteps }: { includeCertificationSteps?: boolean } = {}) {
    super({
      fields,
      steps: includeCertificationSteps ? stepsWithCertChange : steps,
      pathPrefix: '/set-cell-type',
    })
  }
}
