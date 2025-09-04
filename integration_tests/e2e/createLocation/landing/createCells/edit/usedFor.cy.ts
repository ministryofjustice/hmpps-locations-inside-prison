import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import CreateCellsUsedForPage from '../../../../../pages/commonTransactions/createCells/usedFor'

context('Create Landing - Create cells - Edit - Used for', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsConfirmPage()
    })

    it('allows editing', () => {
      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('First night centre / Induction')
      page.cellDetailsValue(2).contains('Standard accommodation')

      page.editUsedForLink().click()
      const usedForPage = Page.verifyOnPage(CreateCellsUsedForPage)
      usedForPage.submit({ usedFor: ['STANDARD_ACCOMMODATION'] })

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('First night centre / Induction').should('not.exist')
      page.cellDetailsValue(2).contains('Standard accommodation')
    })
  })
})
