import Page from '../../../pages/page'
import setupStubs from '../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import checkCellInformation from '../checkCellInformation'
import CreateCellsCellNumbersPage from '../../../pages/commonTransactions/createCells/cellNumbers'

context('Create Landing - Create cells - Edit - Sanitation', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsConfirmPage()
    })

    it('allows editing', () => {
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', '3', '1', '2', '3', '-', 'No'],
        ['A-2-103', '4', '1', '2', '3', '-', 'Yes'],
      ])
      page.editCellNumbersLink().click()

      const cellNumbersPage = Page.verifyOnPage(CreateCellsCellNumbersPage)
      cellNumbersPage.submit({ cellNumbers: ['4', '3', '2', '1'] })

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      checkCellInformation(page, [
        ['A-2-004', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-003', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-002', '3', '1', '2', '3', '-', 'No'],
        ['A-2-001', '4', '1', '2', '3', '-', 'Yes'],
      ])
    })
  })
})
