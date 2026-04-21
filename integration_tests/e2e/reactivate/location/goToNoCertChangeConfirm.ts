import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import goToCheckCapacity from './goToCheckCapacity'
import NoCertChangeConfirmPage from '../../../pages/reactivate/location/noCertChangeConfirm'

export default function goToNoCertChangeConfirm(location: Location) {
  goToCheckCapacity(location).submit()

  return Page.verifyOnPage(NoCertChangeConfirmPage)
}
