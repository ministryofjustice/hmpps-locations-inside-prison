import goToAccommodationTypePage from './goToAccommodationTypePage'
import Page from '../../../pages/page'
import CellConversionUsedForPage from '../../../pages/cellConversion/usedFor'
import CellConversionCertFlowDoorNumberPage from '../../../pages/cellConversion/certificationFlow/doorNumber'

export function goToDoorNumberPageViaUsedFor() {
  goToAccommodationTypePage().submit({ accommodationType: 'NORMAL_ACCOMMODATION' })
  Page.verifyOnPage(CellConversionUsedForPage).submit({ usedForTypes: ['CLOSE_SUPERVISION_CENTRE'] })
  return Page.verifyOnPage(CellConversionCertFlowDoorNumberPage)
}

export function goToDoorNumberPageViaNonNormal() {
  goToAccommodationTypePage().submit({ accommodationType: 'CARE_AND_SEPARATION' })
  return Page.verifyOnPage(CellConversionCertFlowDoorNumberPage)
}

export default goToDoorNumberPageViaUsedFor
