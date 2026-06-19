import Page from '../../../pages/page'
import NonResidentialConversionDetailsPage from '../../../pages/nonResidentialConversion/details'
import goToCertChangeDisclaimerPage from './goToCertChangeDisclaimerPage'

export default function goToDetailsPage() {
  goToCertChangeDisclaimerPage().submit()
  return Page.verifyOnPage(NonResidentialConversionDetailsPage)
}
