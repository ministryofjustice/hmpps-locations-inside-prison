import LocationFactory from '../../../server/testutils/factories/location'
import CertificationApprovalRequestFactory from '../../../server/testutils/factories/certificationApprovalRequest'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import Page from '../../pages/page'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import UpdateSignedOpCapAlreadyRequestedPage from '../../pages/commonTransactions/updateSignedOpCap/alreadyRequested'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'

const prisonId = 'TST'

const residentialSummary = {
  prisonSummary: {
    prisonName: 'Test (HMP)',
    workingCapacity: 8,
    signedOperationalCapacity: 12,
    maxCapacity: 15,
    numberOfCellLocations: 10,
  },
  subLocationName: 'TestWings',
  subLocations: [LocationFactory.build()],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
}

const opCapRequest = CertificationApprovalRequestFactory.build({
  id: 'existing-op-cap-request-id',
  approvalType: 'SIGNED_OP_CAP',
  signedOperationCapacityChange: 8,
  prisonId,
})

function setupCommonStubs() {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  ManageUsersApiStubber.stub.stubManageUsersByCaseload()
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
}

context('Change signed operational capacity - certification flow', () => {
  context('when no change is already in progress', () => {
    let page: CertChangeDisclaimerPage

    beforeEach(() => {
      setupCommonStubs()
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
      cy.signIn()
      cy.visit(`/change-signed-operational-capacity/${prisonId}/`)
      page = new CertChangeDisclaimerPage('Changing the signed operational capacity')
    })

    it('shows the cert change disclaimer page with the correct heading and caption', () => {
      cy.get('h1').contains('Changing the signed operational capacity requires a change to the cell certificate')
      cy.get('[data-qa=title-caption]').contains('Test (HMP)')
    })

    it('shows the correct body copy', () => {
      cy.get('#main-content p').contains(
        'You must submit a change to the cell certificate. This change will be sent to the authorising director for approval.',
      )
    })

    it('has a Continue button that goes to the update signed op cap details page', () => {
      page.continueButton().click()
      Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    })

    it('has a Cancel link that returns to the manage locations page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a Back link that returns to the manage locations page', () => {
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    context('full flow through to submission', () => {
      it('can complete the full certification approval flow', () => {
        page.continueButton().click()

        const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
        detailsPage.submit({ opCap: 14, explanation: 'New wing opened' })

        const submitPage = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        submitPage.submit({ confirm: true })

        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
        Page.checkForSuccessBanner(
          'Change request sent',
          'You have submitted a request to update the cell certificate.',
        )
      })
    })
  })

  context('when a change is already in progress', () => {
    let page: UpdateSignedOpCapAlreadyRequestedPage

    beforeEach(() => {
      setupCommonStubs()
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([opCapRequest])
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(opCapRequest)
      cy.signIn()
      cy.visit(`/change-signed-operational-capacity/${prisonId}/`)
      page = Page.verifyOnPage(UpdateSignedOpCapAlreadyRequestedPage)
    })

    it('shows the correct heading and caption', () => {
      cy.get('h1').contains('A change to the signed operational capacity has already been requested')
      cy.get('[data-qa=title-caption]').contains('Test (HMP)')
    })

    it('shows the body copy about the existing review', () => {
      cy.get('#main-content p').contains(
        'A request to change the signed operational capacity is currently being reviewed.',
      )
    })

    it('shows the proposed signed operational capacity', () => {
      cy.get('.govuk-inset-text').contains('Proposed signed operational capacity')
      cy.get('.govuk-inset-text').contains('20')
    })

    it('has a View change request button linking to the existing request', () => {
      cy.get('a.govuk-button').contains('View change request')
      cy.get('a.govuk-button').should(
        'have.attr',
        'href',
        `/${prisonId}/cell-certificate/change-requests/${opCapRequest.id}`,
      )
    })

    it('has a Cancel link that returns to the manage locations page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a Back link', () => {
      page.backLink().should('exist')
    })
  })

  context('entry via the manage locations page', () => {
    beforeEach(() => {
      setupCommonStubs()
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
      cy.signIn()
    })

    it('can be accessed by clicking the change signed operational capacity link', () => {
      ViewLocationsShowPage.goTo(prisonId)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.capacity.signedOperationalChangeLink().click()

      cy.get('h1').contains('Changing the signed operational capacity requires a change to the cell certificate')
    })
  })
})
