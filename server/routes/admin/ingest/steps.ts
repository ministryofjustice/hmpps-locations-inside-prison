import FormWizard from 'hmpo-form-wizard'
import IngestUpload from '../../../controllers/admin/ingest/upload'
import IngestConfirm from '../../../controllers/admin/ingest/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'upload',
  },
  '/upload': {
    fields: ['file'],
    controller: IngestUpload,
    next: 'confirm',
    enctype: 'multipart/form-data',
  },
  '/confirm': {
    controller: IngestConfirm,
  },
}

export default steps
