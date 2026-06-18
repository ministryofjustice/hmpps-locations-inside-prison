import Page from '../../../pages/page'
import UpdateSignedOpCapDetailsPage from '../../../pages/commonTransactions/updateSignedOpCap/details'
import goToUpdateSignedOpCapIsUpdateNeededPage from './goToUpdateSignedOpCapIsUpdateNeededPage'

export default function goToUpdateSignedOpCapDetailsPage() {
  goToUpdateSignedOpCapIsUpdateNeededPage().submit({ updateNeeded: true })
  return Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
}
