import Page from '../../../pages/page'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import { Location } from '../../../../server/data/types/locationsApi'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'

const goToUpdateSignedOpCapIsUpdateNeeded = (location: Location) => {
  goToCertChangeDisclaimer(location).submit()

  return Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
}

export default goToUpdateSignedOpCapIsUpdateNeeded
