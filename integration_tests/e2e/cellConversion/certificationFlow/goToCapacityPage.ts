import Page from '../../../pages/page'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import goToDoorNumberPage from './goToDoorNumberPage'

export default function goToCapacityPage() {
  goToDoorNumberPage().continueButton().click()
  return Page.verifyOnPage(CellConversionCertFlowCapacityPage)
}
