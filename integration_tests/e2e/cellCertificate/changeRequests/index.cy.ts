import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests/index'
import testGovukTable from '../../../support/testGovukTable'

context('Cell Certificate - Change Requests - Index', () => {
  let page: CellCertificateChangeRequestsIndexPage

  context('With VIEW_INTERNAL_LOCATION role', () => {
    beforeEach(() => {
      setupStubs(['VIEW_INTERNAL_LOCATION'])
      cy.signIn()

      CellCertificateChangeRequestsIndexPage.goTo()
      page = Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
    })

    it('Correctly displays the pending change requests', () => {
      page.changeRequestsLink().should('contain', 'Change requests (2)')

      testGovukTable('change-requests-table', [
        ['A', 'Change signed operational capacity', '3 October 2024', 'john smith', 'View details'],
        ['A', 'Add new locations', '3 October 2024', 'john smith', 'View details'],
      ])
    })
  })

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.signIn()

      CellCertificateChangeRequestsIndexPage.goTo()
      page = Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
    })

    it('Correctly displays the pending change requests', () => {
      page.changeRequestsLink().should('contain', 'Change requests (2)')

      testGovukTable('change-requests-table', [
        ['A', 'Change signed operational capacity', '3 October 2024', 'john smith', 'Review'],
        ['A', 'Add new locations', '3 October 2024', 'john smith', 'Review'],
      ])
    })
  })
})
