import FormWizard from 'hmpo-form-wizard'
import ConfirmDeleteDraftLocation from '../../controllers/deleteDraftLocation/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'confirm',
  },
  '/confirm': {
    controller: ConfirmDeleteDraftLocation,
    buttonClasses: 'govuk-button--warning',
  },
}

export default steps
