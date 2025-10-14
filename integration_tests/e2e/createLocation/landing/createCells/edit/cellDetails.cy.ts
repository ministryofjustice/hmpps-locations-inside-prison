import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import CreateCellsDetailsPage from '../../../../../pages/commonTransactions/createCells/details'
import CreateCellsCellNumbersPage from '../../../../../pages/commonTransactions/createCells/cellNumbers'

context('Create Landing - Create cells - Edit - Cell details', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsConfirmPage()
    })

    it('Walks back through the whole transaction', () => {
      page.editCellDetailsLink().click()

      const cellDetailsPage = Page.verifyOnPage(CreateCellsDetailsPage)
      cellDetailsPage.submit({ cellsToCreate: 4 })

      Page.verifyOnPage(CreateCellsCellNumbersPage)
    })
  })
})
