import Page from '../../pages/page'
import UpdateSignedOpCapAlreadyRequestedPage from '../../pages/commonTransactions/updateSignedOpCap/alreadyRequested'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'

const goToUpdateSignedOpCapAlreadyRequested = (locationId: string) => {
  goToUpdateSignedOpCapIsUpdateNeeded(locationId).submit({ updateNeeded: true })
  return Page.verifyOnPage(UpdateSignedOpCapAlreadyRequestedPage)
}

export default goToUpdateSignedOpCapAlreadyRequested
