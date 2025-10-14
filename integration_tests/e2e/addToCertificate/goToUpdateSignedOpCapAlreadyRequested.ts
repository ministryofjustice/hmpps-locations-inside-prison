import Page from '../../pages/page'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import UpdateSignedOpCapAlreadyRequestedPage from '../../pages/commonTransactions/updateSignedOpCap/alreadyRequested'

const goToUpdateSignedOpCapAlreadyRequested = (locationId: string) => {
  goToCertChangeDisclaimer(locationId).submit()

  return Page.verifyOnPage(UpdateSignedOpCapAlreadyRequestedPage)
}

export default goToUpdateSignedOpCapAlreadyRequested
