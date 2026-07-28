import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeDoorNumberPage from '../../pages/changeDoorNumber/details'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

context('Change door number', () => {
  const draftWing = LocationFactory.build({
    level: 1,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'WINGA',
    parentId: null,
    locationType: 'WING',
    status: 'DRAFT',
    active: false,
    localName: 'draftW',
    code: 'WINGA',
    certifiedCell: false,
  })

  const draftLanding = LocationFactory.build({
    level: 2,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'WINGA-LANDA',
    parentId: draftWing.id,
    locationType: 'LANDING',
    status: 'DRAFT',
    active: false,
    localName: 'draftL',
    code: 'LANDA',
    certifiedCell: false,
  })

  const draftCell = LocationFactory.build({
    level: 3,
    leafLevel: true,
    id: '7e570000-0000-1000-8000-000000000005',
    pathHierarchy: 'WINGA-LANDA-001',
    parentId: draftWing.id,
    locationType: 'CELL',
    status: 'DRAFT',
    active: false,
    localName: null,
    code: '001',
    cellMark: 'A1-01',
    certifiedCell: false,
  })

  const activeWing = LocationFactory.build({
    level: 1,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000006',
    pathHierarchy: 'WINGB',
    parentId: null,
    locationType: 'WING',
    status: 'ACTIVE',
    active: true,
    localName: 'activeW',
    code: 'WINGB',
  })

  const activeLanding = LocationFactory.build({
    level: 2,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000007',
    pathHierarchy: 'WINGB-LANDB',
    parentId: activeWing.id,
    locationType: 'LANDING',
    status: 'ACTIVE',
    active: true,
    localName: 'activeL',
    code: 'LANDB',
  })

  const activeCell = LocationFactory.build({
    level: 3,
    leafLevel: true,
    id: '7e570000-0000-1000-8000-000000000008',
    pathHierarchy: 'WINGB-LANDB-001',
    parentId: activeLanding.id,
    locationType: 'CELL',
    status: 'ACTIVE',
    active: true,
    localName: null,
    code: '001',
    cellMark: 'B1-01',
  })

  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationByCellMark()
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftWing,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftCell,
      })
      LocationsApiStubber.stub.stubLocations(draftWing)
      LocationsApiStubber.stub.stubLocations(draftCell)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the change door number link on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftWing.prisonId, draftCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeDoorNumberLink().should('not.exist')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageUsersByCaseload()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationByCellMark()
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubLocationsDeleteLocation()
      LocationsApiStubber.stub.stubPatchLocation()
      LocationsApiStubber.stub.stubPutLocationForCellMark()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftWing,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftCell,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: activeWing,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: activeCell,
      })
      LocationsApiStubber.stub.stubLocations(draftWing)
      LocationsApiStubber.stub.stubLocations(draftCell)
      LocationsApiStubber.stub.stubLocations(activeWing)
      LocationsApiStubber.stub.stubLocations(activeCell)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Change door number', () => {
      beforeEach(() => {
        ViewLocationsShowPage.goTo(draftLanding.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeDoorNumberLink().click()
      })

      it('shows the input prefix when changing the location code of a DRAFT landing', () => {
        const page = Page.verifyOnPage(ChangeDoorNumberPage)

        page.submit({ doorNumber: 'L-01' })

        Page.verifyOnPage(ViewLocationsShowPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell door number changed')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have changed the door number for cell WINGA-LANDA-001.',
        )
      })

      it('changes the door number of an ACTIVE cell with certification approval request', () => {
        ViewLocationsShowPage.goTo(activeCell.prisonId, activeCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeDoorNumberLink().click()

        const disclaimerPage = new CertChangeDisclaimerPage('Changing cell door number')
        disclaimerPage.submit()

        const detailsPage = Page.verifyOnPage(ChangeDoorNumberPage)
        detailsPage.submit({ doorNumber: 'B-02', explanation: 'Updating door number for operational reasons' })

        const confirmPage = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)

        cy.contains('Change cell door number').should('be.visible')
        cy.contains('Updating door number for operational reasons').should('be.visible')
        cy.contains('B1-01 → B-02').should('be.visible')

        confirmPage.submit({ confirm: true })

        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request sent')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have submitted a request to update the cell certificate.',
        )
      })
    })
  })
})
