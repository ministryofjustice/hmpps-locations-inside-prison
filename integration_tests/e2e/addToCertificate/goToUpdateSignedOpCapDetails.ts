import Page from '../../pages/page'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'

const goToUpdateSignedOpCapDetails = (locationId: string) => {
  goToUpdateSignedOpCapIsUpdateNeeded(locationId).submit({ updateNeeded: true })

  return Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
}

export default goToUpdateSignedOpCapDetails
