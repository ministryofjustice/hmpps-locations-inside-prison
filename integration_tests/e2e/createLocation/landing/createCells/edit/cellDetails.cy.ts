import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import CreateCellsDetailsPage from '../../../../../pages/commonTransactions/createCells/details'
import CreateCellsCellNumbersPage from '../../../../../pages/commonTransactions/createCells/cellNumbers'

context('Create Landing - Create cells - Edit - Cell details', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsConfirmPage()
    })

    context('When any value changes', () => {
      it('Walks back through the whole transaction', () => {
        page.editCellDetailsLink().click()

        const cellDetailsPage = Page.verifyOnPage(CreateCellsDetailsPage)
        cellDetailsPage.submit({ cellsToCreate: 3, accommodationType: 'NORMAL_ACCOMMODATION' })

        Page.verifyOnPage(CreateCellsCellNumbersPage)
      })
    })

    context('When no values change', () => {
      it('Goes back to confirm', () => {
        page.editCellDetailsLink().click()

        const cellDetailsPage = Page.verifyOnPage(CreateCellsDetailsPage)
        cellDetailsPage.submit({ cellsToCreate: 4, accommodationType: 'NORMAL_ACCOMMODATION' })

        Page.verifyOnPage(CreateLocationConfirmPage)
      })
    })
  })
})
