import Page from '../../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import CreateCellsCellNumbersPage from '../../../pages/commonTransactions/createCells/cellNumbers'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'

context('Edit cells - Existing landing - Edit - Cell numbers', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('allows editing only for DRAFT cells', () => {
      checkCellInformation(page, [
        ['A-2-003', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-004', '4', '4', '5', '6', '-', 'Yes'],
        ['A-2-005', '5', '5', '6', '7', '-', 'No'],
      ])
      page.editCellNumbersLink().click()

      const cellNumbersPage = Page.verifyOnPage(CreateCellsCellNumbersPage)
      cellNumbersPage.submit({ cellNumbers: ['13', '14', '15'] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-013', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-014', '4', '4', '5', '6', '-', 'Yes'],
        ['A-2-015', '5', '5', '6', '7', '-', 'No'],
      ])
      page.cellInformationTable().should('not.contain', 'A-2-001')
      page.cellInformationTable().should('not.contain', 'A-2-002')
    })
  })
})
