import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'
import CreateCellsDoorNumbersPage from '../../../pages/commonTransactions/createCells/doorNumbers'

context('Edit cells - Draft landing - Confirm', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    context('when no changes are made', () => {
      it('shows the correct information and redirects back to view location', () => {
        page.cellDetailsKey(0).contains('Number of cells')
        page.cellDetailsValue(0).contains('2')

        page.cellDetailsKey(1).contains('Accommodation type')
        page.cellDetailsValue(1).contains('Normal accommodation')

        page.cellDetailsKey(2).contains('Used for')
        page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

        checkCellInformation(page, [
          ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
          ['A-2-002', '2', '2', '3', '4', '-', 'Yes'],
        ])

        page.updateCellsButton().click()

        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.successBannerHeading().should('not.exist')
      })
    })

    context('when changes are made', () => {
      beforeEach(() => {
        page.editDoorNumbersLink().click()
        const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
        doorNumbersPage.submit({ doorNumbers: ['A2-01', 'A2-02'] })

        page = Page.verifyOnPage(EditCellsConfirmPage)
      })

      it('shows the correct information and shows a success banner on submit', () => {
        page.cellDetailsKey(0).contains('Number of cells')
        page.cellDetailsValue(0).contains('2')

        page.cellDetailsKey(1).contains('Accommodation type')
        page.cellDetailsValue(1).contains('Normal accommodation')

        page.cellDetailsKey(2).contains('Used for')
        page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

        checkCellInformation(page, [
          ['A-2-001', 'A2-01', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
          ['A-2-002', 'A2-02', '2', '3', '4', '-', 'Yes'],
        ])

        page.updateCellsButton().click()

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
