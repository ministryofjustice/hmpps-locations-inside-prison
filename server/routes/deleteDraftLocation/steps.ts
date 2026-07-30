import FormWizard from 'hmpo-form-wizard'
import ConfirmDeleteDraftLocation from '../../controllers/deleteDraftLocation/confirm'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
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
