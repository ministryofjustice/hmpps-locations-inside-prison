import FormWizard from 'hmpo-form-wizard'
import ImportUpload from '../../controllers/cellCertificateImports/upload'
import ImportConfirm from '../../controllers/cellCertificateImports/confirm'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'upload',
    backLink: (_req, res) => paths.prison.cellCertificateImports(res.locals.prisonId),
  },
  '/upload': {
    fields: ['file'],
    controller: ImportUpload,
    next: 'confirm',
    enctype: 'multipart/form-data',
    pageTitle: 'Import cell certificate data',
  },
  '/confirm': {
    controller: ImportConfirm,
    pageTitle: 'Confirm cell certificate import',
  },
}

export default steps
