import goToAccommodationTypePage from './goToAccommodationTypePage'
import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionAccommodationTypePage from '../../../pages/cellConversion/accommodationType'
import CellConversionUsedForPage from '../../../pages/cellConversion/usedFor'
import CellConversionCertFlowDoorNumberPage from '../../../pages/cellConversion/certificationFlow/doorNumber'

context('Cell conversion - Cert flow - Used for', () => {
  let page: CellConversionUsedForPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      const accommodationTypePage = goToAccommodationTypePage()
      accommodationTypePage.submit({ accommodationType: 'NORMAL_ACCOMMODATION' })
      page = Page.verifyOnPage(CellConversionUsedForPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CellConversionAccommodationTypePage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct validation error when nothing is selected', () => {
      page.submit({})

      Page.checkForError('usedForTypes', 'Select what the location is used for')
    })

    it('goes to the door number page on continue', () => {
      page.submit({ usedForTypes: ['CLOSE_SUPERVISION_CENTRE'] })

      Page.verifyOnPage(CellConversionCertFlowDoorNumberPage)
    })
  })
})
