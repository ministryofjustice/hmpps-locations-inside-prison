import FormWizard from 'hmpo-form-wizard'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${res.locals.decoratedLocation.prisonId}/${res.locals.decoratedLocation.id}`,
    next: 'cert-change-disclaimer',
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'reason',
    title: (_req, _res) => 'Archiving a location',
  }),
}

export default steps
