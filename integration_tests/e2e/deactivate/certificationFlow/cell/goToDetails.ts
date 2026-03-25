import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import DeactivateTemporaryDetailsPage from '../../../../pages/deactivate/temporary/details'
import Page from '../../../../pages/page'

export default function goToDetails() {
  goToCertChangeDisclaimer().submit()

  return Page.verifyOnPage(DeactivateTemporaryDetailsPage)
}
