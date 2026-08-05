import FormWizard from 'hmpo-form-wizard'
import RequestsPending from '../../controllers/requestsPending'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/requests-pending': {
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
    checkJourney: false,
    controller: RequestsPending,
    pageTitle: 'You can’t request a change to the certificate for this location currently',
    templatePath: 'pages/requestsPending',
    template: 'index',
  },
}

export default steps
