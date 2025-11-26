import Page from '../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import CreateCellsUsedForPage from '../../pages/commonTransactions/createCells/usedFor'
import EditCellsConfirmPage from '../../pages/editCells/confirm'

context('Create Landing - Create cells - Edit - Used for', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('allows editing', () => {
      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('First night centre / Induction').should('not.exist')
      page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

      page.editUsedForLink().click()
      const usedForPage = Page.verifyOnPage(CreateCellsUsedForPage)
      usedForPage.submit({ usedFor: ['FIRST_NIGHT_CENTRE'] })

      page = Page.verifyOnPage(EditCellsConfirmPage)
      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('First night centre / Induction')
      page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)').should('not.exist')
    })
  })
})
