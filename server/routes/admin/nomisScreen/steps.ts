import FormWizard from 'hmpo-form-wizard'
import NomisScreenStatusChangeConfirm from '../../../controllers/admin/nomisScreen/confirm'
import paths from '../../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'confirm',
    backLink: (_req, res) => paths.admin.index(res.locals.prisonId),
  },
  '/confirm': {
    fields: ['screenStatus'],
    controller: NomisScreenStatusChangeConfirm,
  },
}

export default steps
