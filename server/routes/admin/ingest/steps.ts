import IngestUpload from '../../../controllers/admin/ingest/upload'
import IngestConfirm from '../../../controllers/admin/ingest/confirm'

const steps = {
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
  },
  '/confirm': {
    controller: IngestConfirm,
  },
}

export default steps
