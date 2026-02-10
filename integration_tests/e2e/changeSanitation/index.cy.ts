import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeSanitationPage from '../../pages/changeSanitation/details'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'

context('Change sanitation', () => {
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
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
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
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
  })

  const draftCell = LocationFactory.build({
    level: 3,
    leafLevel: true,
    id: '7e570000-0000-1000-8000-000000000005',
    pathHierarchy: 'A-1-001',
    parentId: draftLanding.id,
    locationType: 'CELL',
    status: 'DRAFT',
    active: false,
    localName: null,
    code: '001',
    cellMark: 'A1-01',
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
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
    certification: {
      certified: true,
      capacityOfCertifiedCell: 10,
    },
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
    certification: {
      certified: true,
      capacityOfCertifiedCell: 10,
    },
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
    inCellSanitation: true,
    certification: {
      certified: true,
      capacityOfCertifiedCell: 1,
    },
  })

  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsCertificationRequestApprovalsPrison', [])
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftLanding,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftLanding)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the change sanitation link on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeSanitationLink().should('not.exist')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsCertificationRequestApprovalsPrison', [])
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsDeleteLocation')
      cy.task('stubPatchLocation')
      cy.task('stubPutLocation')
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftLanding,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: activeWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: activeCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftLanding)
      cy.task('stubLocations', draftCell)
      cy.task('stubLocations', activeWing)
      cy.task('stubLocations', activeCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Change sanitation', () => {
      beforeEach(() => {
        ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeSanitationLink().click()
      })

      it('shows the success banner after submitting', () => {
        const page = Page.verifyOnPage(ChangeSanitationPage)

        page.submit({ inCellSanitation: true })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Sanitation changed', 'You have changed sanitation for A-1-001.')
      })

      it('changes the sanitation of an ACTIVE cell with certification approval request', () => {
        ViewLocationsShowPage.goTo(activeCell.prisonId, activeCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeSanitationLink().click()

        const disclaimerPage = new CertChangeDisclaimerPage('Changing cell sanitation')
        disclaimerPage.submit()

        const detailsPage = Page.verifyOnPage(ChangeSanitationPage)
        detailsPage.submit({ inCellSanitation: false, explanation: 'Updating sanitation for operational reasons' })

        const confirmPage = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)

        cy.contains('Change cell sanitation').should('be.visible')
        cy.contains('Updating sanitation for operational reasons').should('be.visible')
        cy.contains('Yes → No').should('be.visible')

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
