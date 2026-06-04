import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import isCertActiveAndNotDraft from '../../utils/isCertActiveAndNotDraft'

export default function isCellTypeCertChange(_req: FormWizard.Request, res: Response) {
  return isCertActiveAndNotDraft(res.locals)
}
