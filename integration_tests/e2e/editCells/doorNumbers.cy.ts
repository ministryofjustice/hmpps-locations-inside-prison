import Page from '../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import CreateCellsDoorNumbersPage from '../../pages/commonTransactions/createCells/doorNumbers'
import EditCellsConfirmPage from '../../pages/editCells/confirm'

context('Create Landing - Create cells - Edit - Sanitation', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('allows editing', () => {
      checkCellInformation(page, [
        ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-002', '2', '2', '3', '4', '-', 'Yes'],
      ])
      page.editDoorNumbersLink().click()

      const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
      doorNumbersPage.submit({ doorNumbers: ['abc4', 'abc3'] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-001', 'abc4', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-002', 'abc3', '2', '3', '4', '-', 'Yes'],
      ])
    })
  })
})
