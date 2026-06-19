import Page from '../../../pages/page'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import goToDetailsPage from './goToDetailsPage'

export default function goToUpdateSignedOpCapIsUpdateNeededPage() {
  goToDetailsPage().submit({ convertedCellType: 'OFFICE', explanation: 'Want to change the room usage' })
  return Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
}
