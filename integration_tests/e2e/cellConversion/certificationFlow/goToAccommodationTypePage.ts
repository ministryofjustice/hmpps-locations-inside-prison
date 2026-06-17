import goToCertChangeDisclaimerPage from './goToCertChangeDisclaimerPage'
import CellConversionAccommodationTypePage from '../../../pages/cellConversion/accommodationType'
import Page from '../../../pages/page'

export default function goToAccommodationTypePage() {
  goToCertChangeDisclaimerPage().submit()
  return Page.verifyOnPage(CellConversionAccommodationTypePage)
}
