import FormWizard from 'hmpo-form-wizard'
import IngestUpload from '../../controllers/cellCertificateUploads/upload'
import IngestConfirm from '../../controllers/cellCertificateUploads/confirm'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'upload',
    backLink: (_req, res) => paths.prison.cellCertificateUploads(res.locals.prisonId),
  },
  '/upload': {
    fields: ['file'],
    controller: IngestUpload,
    next: 'confirm',
    enctype: 'multipart/form-data',
    pageTitle: 'Import cell certificate data',
  },
  '/confirm': {
    controller: IngestConfirm,
    pageTitle: 'Confirm cell certificate import',
  },
}

export default steps
