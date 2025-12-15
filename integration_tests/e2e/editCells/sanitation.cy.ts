import Page from '../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import CreateCellsWithoutSanitationPage from '../../pages/commonTransactions/createCells/withoutSanitation'
import CreateCellsBulkSanitationPage from '../../pages/commonTransactions/createCells/bulkSanitation'
import checkCellInformation from './checkCellInformation'
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
      page.editSanitationLink().click()

      let bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: true })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'Yes'],
        ['A-2-002', '2', '2', '3', '4', '-', 'Yes'],
      ])
      page.editSanitationLink().click()

      bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: false })

      const withoutSanitationPage = Page.verifyOnPage(CreateCellsWithoutSanitationPage)
      withoutSanitationPage.submit({ withoutSanitation: [0, 1] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-002', '2', '2', '3', '4', '-', 'No'],
      ])
    })
  })
})
