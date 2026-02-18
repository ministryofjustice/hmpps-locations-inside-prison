import { Location } from '../../../../server/data/types/locationsApi'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import Page from '../../../pages/page'
import CheckCapacityPage from '../../../pages/reactivate/location/checkCapacity'

export default function goToCheckCapacity(location: Location) {
  goToCertChangeDisclaimer(location).submit()

  return Page.verifyOnPage(CheckCapacityPage)
}
