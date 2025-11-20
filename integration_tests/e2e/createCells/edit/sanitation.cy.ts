import Page from '../../../pages/page'
import setupStubs from '../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import CreateCellsWithoutSanitationPage from '../../../pages/commonTransactions/createCells/withoutSanitation'
import CreateCellsBulkSanitationPage from '../../../pages/commonTransactions/createCells/bulkSanitation'
import checkCellInformation from '../checkCellInformation'

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
      page.editSanitationLink().click()

      let bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: true })

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'Yes'],
        ['A-2-101', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', '3', '1', '2', '3', '-', 'Yes'],
        ['A-2-103', '4', '1', '2', '3', '-', 'Yes'],
      ])
      page.editSanitationLink().click()

      bulkSanitationPage = Page.verifyOnPage(CreateCellsBulkSanitationPage)
      bulkSanitationPage.submit({ bulkSanitation: false })

      const withoutSanitationPage = Page.verifyOnPage(CreateCellsWithoutSanitationPage)
      withoutSanitationPage.submit({ withoutSanitation: [0, 1, 2, 3] })

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', '2', '1', '2', '3', '-', 'No'],
        ['A-2-102', '3', '1', '2', '3', '-', 'No'],
        ['A-2-103', '4', '1', '2', '3', '-', 'No'],
      ])
    })
  })
})
