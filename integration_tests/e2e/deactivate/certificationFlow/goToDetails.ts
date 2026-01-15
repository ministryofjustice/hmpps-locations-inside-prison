import { Location } from '../../../../server/data/types/locationsApi'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import DeactivateTemporaryDetailsPage from '../../../pages/deactivate/temporary/details'
import Page from '../../../pages/page'

export default function goToDetails(location: Location) {
  goToCertChangeDisclaimer(location).submit()

  return Page.verifyOnPage(DeactivateTemporaryDetailsPage)
}
