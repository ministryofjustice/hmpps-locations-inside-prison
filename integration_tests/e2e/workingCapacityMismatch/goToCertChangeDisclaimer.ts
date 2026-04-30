import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import goToDetails from './goToDetails'
import Page from '../../pages/page'

export default function goToCertChangeDisclaimer() {
  goToDetails().submit({ certified: true })

  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Changing the cell’s capacity')
}
