import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import { Location } from '../../../../server/data/types/locationsApi'
import capFirst from '../../../../server/formatters/capFirst'
import goToCheckCapacity from './goToCheckCapacity'

export default function goToCertChangeDisclaimer(location: Location) {
  goToCheckCapacity(location).submit()
  return new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
}
