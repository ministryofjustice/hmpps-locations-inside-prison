import Page from '../../pages/page'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'

const goToUpdateSignedOpCapIsUpdateNeeded = () => {
  goToCertChangeDisclaimer().submit()

  return Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
}

export default goToUpdateSignedOpCapIsUpdateNeeded
