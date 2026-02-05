import Page from '../../../../pages/page'
import goToSignedOpCapUpdateNeeded from './goToSignedOpCapUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../../pages/commonTransactions/updateSignedOpCap/details'

export default function goToSignedOpCapUpdateDetails() {
  goToSignedOpCapUpdateNeeded().submit({
    updateNeeded: true,
  })

  return Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
}
