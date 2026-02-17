import FormWizard from 'hmpo-form-wizard'
import ReactivateLocationInit from '../../../controllers/reactivate/location/init'
import CertChangeDisclaimer from '../../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../../formatters/capFirst'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) => {
      const { prisonId, id } = res.locals.decoratedLocation

      return `/view-and-update-locations/${prisonId}/${id}`
    },
    next: 'cert-change-disclaimer',
    controller: ReactivateLocationInit,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'check-capacity',
    title: (_req, res) => `${res.locals.decoratedLocation.locationType} activation`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)}`,
  }),
}

export default steps
