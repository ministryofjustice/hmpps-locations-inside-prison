import Page from '../../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import CreateCellsDoorNumbersPage from '../../../pages/commonTransactions/createCells/doorNumbers'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'

context('Edit cells - Existing landing - Edit - Door numbers', () => {
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
      page.editDoorNumbersLink().click()

      const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
      doorNumbersPage.submit({ doorNumbers: ['abc3', 'abc4', 'abc5'] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-003', 'abc3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-004', 'abc4', '4', '5', '6', '-', 'Yes'],
        ['A-2-005', 'abc5', '5', '6', '7', '-', 'No'],
      ])
      page.cellInformationTable().should('not.contain', 'A-2-001')
      page.cellInformationTable().should('not.contain', 'A-2-002')
    })
  })
})
