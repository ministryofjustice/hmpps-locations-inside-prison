import goToAccommodationTypePage from './goToAccommodationTypePage'
import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import CellConversionAccommodationTypePage from '../../../pages/cellConversion/accommodationType'
import CellConversionUsedForPage from '../../../pages/cellConversion/usedFor'
import CellConversionCertFlowDoorNumberPage from '../../../pages/cellConversion/certificationFlow/doorNumber'

context('Cell conversion - Cert flow - Accommodation type', () => {
  let page: CellConversionAccommodationTypePage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToAccommodationTypePage()
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a non-residential room to a cell')
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct validation error when nothing is selected', () => {
      page.submit({})

      Page.checkForError('accommodationType', 'Select an accommodation type')
    })

    it('goes to the used for page when NORMAL_ACCOMMODATION is selected', () => {
      page.submit({ accommodationType: 'NORMAL_ACCOMMODATION' })

      Page.verifyOnPage(CellConversionUsedForPage)
    })

    it('goes to the door number page when a non-normal accommodation type is selected', () => {
      page.submit({ accommodationType: 'CARE_AND_SEPARATION' })

      Page.verifyOnPage(CellConversionCertFlowDoorNumberPage)
    })
  })
})
