import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'
import CreateCellsDoorNumbersPage from '../../../pages/commonTransactions/createCells/doorNumbers'

context('Edit cells - Existing landing - Confirm', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    context('when no changes are made', () => {
      it('shows only DRAFT cells and redirects back to view location', () => {
        page.cellDetailsKey(0).contains('Number of cells')
        page.cellDetailsValue(0).contains('3')

        page.cellDetailsKey(1).contains('Accommodation type')
        page.cellDetailsValue(1).contains('Normal accommodation')

        page.cellDetailsKey(2).contains('Used for')
        page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

        checkCellInformation(page, [
          ['A-2-003', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
          ['A-2-004', '4', '4', '5', '6', '-', 'Yes'],
          ['A-2-005', '5', '5', '6', '7', '-', 'No'],
        ])

        page.cellInformationTable().should('not.contain', 'A-2-001')
        page.cellInformationTable().should('not.contain', 'A-2-002')

        page.createButton().click()

        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.successBannerHeading().should('not.exist')
      })
    })

    context('when changes are made', () => {
      beforeEach(() => {
        page.editDoorNumbersLink().click()
        const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
        doorNumbersPage.submit({ doorNumbers: ['A2-03', 'A2-04', 'A2-05'] })

        page = Page.verifyOnPage(EditCellsConfirmPage)
      })

      it('shows only DRAFT cells and shows a success banner on submit', () => {
        page.cellDetailsKey(0).contains('Number of cells')
        page.cellDetailsValue(0).contains('3')

        page.cellDetailsKey(1).contains('Accommodation type')
        page.cellDetailsValue(1).contains('Normal accommodation')

        page.cellDetailsKey(2).contains('Used for')
        page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

        checkCellInformation(page, [
          ['A-2-003', 'A2-03', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
          ['A-2-004', 'A2-04', '4', '5', '6', '-', 'Yes'],
          ['A-2-005', 'A2-05', '5', '6', '7', '-', 'No'],
        ])

        page.cellInformationTable().should('not.contain', 'A-2-001')
        page.cellInformationTable().should('not.contain', 'A-2-002')

        page.createButton().click()

        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.successBannerHeading().contains('Cells updated')
        viewLocationsShowPage.successBannerBody().contains('You have updated cells on A-2.')
      })
    })

    it('has a back link to the view location show page', () => {
      page.backLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
