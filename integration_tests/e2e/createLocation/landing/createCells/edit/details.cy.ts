import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import CreateLocationDetailsPage from '../../../../../pages/createLocation'

context('Create Landing - Create cells - Edit - Details', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsConfirmPage()
    })

    context('When createCellsNow changes', () => {
      it('Goes back to confirm', () => {
        page.editDetailsLink().click()

        let detailsPage = Page.verifyOnPage(CreateLocationDetailsPage)
        detailsPage.submit({ locationCode: 'test', createCellsNow: false })

        Page.verifyOnPage(CreateLocationConfirmPage)
        page.editDetailsLink().click()

        detailsPage = Page.verifyOnPage(CreateLocationDetailsPage)
        detailsPage.submit({ locationCode: 'test', createCellsNow: true })

        Page.verifyOnPage(CreateLocationConfirmPage)
      })
    })

    context('When no values change', () => {
      it('Goes back to confirm', () => {
        page.editDetailsLink().click()

        const detailsPage = Page.verifyOnPage(CreateLocationDetailsPage)
        detailsPage.submit({ locationCode: 'test', createCellsNow: true })

        Page.verifyOnPage(CreateLocationConfirmPage)
      })
    })
  })
})
