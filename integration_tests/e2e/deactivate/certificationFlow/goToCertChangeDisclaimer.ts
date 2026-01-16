import { Location } from '../../../../server/data/types/locationsApi'
import goToCellCertChange from './goToCellCertChange'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'

export default function goToCertChangeDisclaimer(location: Location) {
  goToCellCertChange(location).submit({ certChange: true })

  return new CertChangeDisclaimerPage('Decreasing certified working capacity')
}
