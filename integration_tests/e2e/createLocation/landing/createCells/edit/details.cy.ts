import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import CreateCellsDetailsPage from '../../../../../pages/commonTransactions/createCells/details'
import CreateLocationDetailsPage from '../../../../../pages/createLocation'

context('Create Landing - Create cells - Edit - Details', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsConfirmPage()
    })

    it('Walks back through the whole transaction', () => {
      page.editDetailsLink().click()

      const detailsPage = Page.verifyOnPage(CreateLocationDetailsPage)
      detailsPage.submit({ locationCode: 'test', createCellsNow: true })

      Page.verifyOnPage(CreateCellsDetailsPage)
    })
  })
})
