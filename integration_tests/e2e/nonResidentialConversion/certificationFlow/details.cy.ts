import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import NonResidentialConversionDetailsPage from '../../../pages/nonResidentialConversion/details'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import goToDetailsPage from './goToDetailsPage'

context('Non-residential conversion - Cert flow - Details', () => {
  let page: NonResidentialConversionDetailsPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs()
      page = goToDetailsPage()
    })

    it('has a back link to the cert change disclaimer page', () => {
      page.backLink().click()

      Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a cell to a non-residential room')
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct radio buttons', () => {
      page.cellTypeRadioLabels().contains('Kitchen / Servery')
      page.cellTypeRadioLabels().contains('Office')
      page.cellTypeRadioLabels().contains('Other')
    })

    it('shows a validation error when nothing is selected', () => {
      page.submit({ explanation: 'Want to change the room usage' })

      Page.checkForError('convertedCellType', 'Select a non-residential room type')
    })

    it('shows a validation error when other is selected with no description', () => {
      page.submit({ convertedCellType: 'OTHER', explanation: 'Want to change the room usage' })

      Page.checkForError('otherConvertedCellType', 'Enter a room description')
    })

    it('shows a validation error when other is selected with a description over 30 characters', () => {
      page.submit({
        convertedCellType: 'OTHER',
        otherConvertedCellType: 'This description is over 30 characters',
        explanation: 'Want to change the room usage',
      })

      Page.checkForError('otherConvertedCellType', 'Room description must be 30 characters or less')
    })

    it('shows a validation error when no reason is given', () => {
      page.submit({ convertedCellType: 'OFFICE' })

      Page.checkForError('explanation', 'Enter a reason for this change')
    })

    it('continues to the signed op cap update page when valid data is submitted', () => {
      page.submit({ convertedCellType: 'OFFICE', explanation: 'Want to change the room usage' })

      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
    })
  })
})
