import Page from '../../pages/page'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'

const goToUpdateSignedOpCapIsUpdateNeeded = (locationId: string) => {
  goToCertChangeDisclaimer(locationId).submit()

  return Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
}

export default goToUpdateSignedOpCapIsUpdateNeeded
