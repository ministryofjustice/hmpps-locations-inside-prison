import Page from '../../../pages/page'
import CellConversionCertFlowSanitationPage from '../../../pages/cellConversion/certificationFlow/sanitation'
import goToCapacityPage from './goToCapacityPage'

export default function goToSanitationPage() {
  const capacityPage = goToCapacityPage()
  capacityPage.baselineCnaInput().clear().type('1')
  capacityPage.workingCapacityInput().clear().type('1')
  capacityPage.maximumCapacityInput().clear().type('2')
  capacityPage.continueButton().click()
  return Page.verifyOnPage(CellConversionCertFlowSanitationPage)
}
