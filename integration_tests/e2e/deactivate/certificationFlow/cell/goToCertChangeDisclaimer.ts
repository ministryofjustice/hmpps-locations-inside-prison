import goToCellCertChange from './goToCellCertChange'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'

export default function goToCertChangeDisclaimer() {
  goToCellCertChange().submit({ certChange: true })

  return new CertChangeDisclaimerPage('Decreasing certified working capacity')
}
