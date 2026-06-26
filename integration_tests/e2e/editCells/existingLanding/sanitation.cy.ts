import Page from '../../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import CreateCellsWithoutSanitationPage from '../../../pages/commonTransactions/createCells/withoutSanitation'
import CreateCellsBulkSanitationPage from '../../../pages/commonTransactions/createCells/bulkSanitation'
import checkCellInformation from './checkCellInformation'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'

context('Edit cells - Existing landing - Edit - Sanitation', () => {
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
      page.editSanitationLink().click()

      let bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: true })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-003', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'Yes'],
        ['A-2-004', '4', '4', '5', '6', '-', 'Yes'],
        ['A-2-005', '5', '5', '6', '7', '-', 'Yes'],
      ])
      page.editSanitationLink().click()

      bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: false })

      const withoutSanitationPage = Page.verifyOnPage(CreateCellsWithoutSanitationPage)
      withoutSanitationPage.submit({ withoutSanitation: [0, 1, 2] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-003', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-004', '4', '4', '5', '6', '-', 'No'],
        ['A-2-005', '5', '5', '6', '7', '-', 'No'],
      ])
      page.cellInformationTable().should('not.contain', 'A-2-001')
      page.cellInformationTable().should('not.contain', 'A-2-002')
    })
  })
})
