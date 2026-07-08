import LocationFactory from '../../../server/testutils/factories/location'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import ArchiveReasonPage from '../../pages/archiveLocation/archiveReason'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import Page from '../../pages/page'
import RequestsPendingPage from '../../pages/requestsPending'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Archive location', () => {
  let location: ReturnType<typeof LocationFactory.build>

  beforeEach(() => {
    cy.task('reset')
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
    LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
    LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
    LocationsApiStubber.stub.stubLocationsConstantsLocationType()
    LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
    LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
    LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  })

  context('without any roles', () => {
    beforeEach(() => {
      location = LocationFactory.build({
        active: false,
        inactiveStatus: 'INACTIVE_TEMP',
        locationType: 'CELL',
      })
      AuthStubber.stub.stubSignIn()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
      LocationsApiStubber.stub.stubLocations(location)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
      cy.task('setFeatureFlag', { archiveLocation: true })
      cy.signIn()
    })

    it('does not show the archive button in the banner', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.archiveCellButton().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
    })

    context('when feature flag is disabled', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_TEMP',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: false })
        cy.signIn()
      })

      it('does not show the archive button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().should('not.exist')
      })
    })

    context('when certification is disabled for the prison', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_TEMP',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()
      })

      it('does not show the archive button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().should('not.exist')
      })
    })

    context('with active location', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: true,
          inactiveStatus: undefined,
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()
      })

      it('does not show the archive button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().should('not.exist')
      })
    })

    context('with temp inactive location', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_TEMP',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()
      })

      it('can be accessed via the archive cell button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()

        cy.location('pathname').should('contain', '/archive')
      })
    })

    context('with inactive location with capacity decreased on cell cert', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()
      })

      it('can be accessed via the archive cell button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()

        cy.location('pathname').should('contain', '/archive')
      })
    })

    context('when location is a landing', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'LANDING',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()
      })

      it('can be accessed via the archive landing button in the banner', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveLandingButton().click()

        cy.location('pathname').should('contain', '/archive')
      })
    })

    describe('requests pending page', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({
          hasPendingBelow: true,
          pendingLocations: [
            {
              id: '6bcfab2c-df86-467b-89ca-e1eb1bb84249',
              key: 'LEI-A-1-016',
              locationType: 'CELL',
              parentId: 'd8ddb0a7-1e39-425c-a32f-d128e80ca05b',
              parentKey: 'LEI-A-1',
              parentLocationType: 'LANDING',
            },
          ],
        })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()

        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()
      })

      it('has a back link to the view location page', () => {
        const requestsPendingPage = Page.verifyOnPage(RequestsPendingPage)
        requestsPendingPage.backLink().click()
        Page.verifyOnPage(ViewLocationsIndexPage)
      })

      it('has a cancel link that leads to the view location page', () => {
        const requestsPendingPage = Page.verifyOnPage(RequestsPendingPage)
        requestsPendingPage.returnLink().click()
        Page.verifyOnPage(ViewLocationsIndexPage)
      })

      it('has a link to the cert approvals page', () => {
        const requestsPendingPage = Page.verifyOnPage(RequestsPendingPage)
        requestsPendingPage.certApprovalsLink().click()
        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
      })
    })

    describe('cert disclaimer page', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()

        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()
      })

      it('has a back link to the view location page', () => {
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.backLink().click()
        Page.verifyOnPage(ViewLocationsIndexPage)
      })

      it('has a cancel link that leads to the view location page', () => {
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.cancelLink().click()
        Page.verifyOnPage(ViewLocationsIndexPage)
      })

      it('has a continue button that leads to the reason page', () => {
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.continueButton().click()
        cy.location('pathname').should('contain', '/archive/reason')
      })
    })

    describe('reason for archiving page', () => {
      const multilineText = 'This is a line of text\n\nThis is another line of text'

      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()

        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.continueButton().click()
      })

      it('has a back link to the cert disclaimer page', () => {
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.backLink().click()
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.checkOnPage()
      })

      it('has a cancel link that leads to the view location page', () => {
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.cancelLink().click()
        Page.verifyOnPage(ViewLocationsIndexPage)
      })

      it('shows a validation error if the reason is blank', () => {
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.submit('')
        Page.checkForError('reason', 'Explain why this location is being archived')
      })

      it('continues to the check op cap page when submitting', () => {
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.submit(multilineText)
        Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
      })

      it('preserves line breaks', () => {
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.submit(multilineText)
        const opCapCheckPage = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
        opCapCheckPage.backLink().click()
        reasonPage
          .reasonInput()
          .invoke('val')
          .then(value => {
            expect(value).to.equal(multilineText)
          })
      })
    })

    describe('update signed op cap flow', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
        cy.task('setFeatureFlag', { archiveLocation: true })
        cy.signIn()

        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.archiveCellButton().click()
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.continueButton().click()
        const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
        reasonPage.submit('Wing demolished')
      })

      it('progresses to the cert update details page when no is selected', () => {
        const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
        isUpdateNeeded.submit({ updateNeeded: false })

        Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
      })

      it('flows through to the cert update details page when yes is selected', () => {
        const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
        isUpdateNeeded.submit({ updateNeeded: true })
        const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)

        detailsPage.submit({ opCap: 9, explanation: 'Op cap update was needed' })
        Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
      })
    })

    describe('submit cert approval request page', () => {
      const multilineText = 'This is a line of text\n\nThis is another line of text'

      const subLocations = [
        LocationFactory.build({
          id: 'id1',
          pathHierarchy: 'A-1-001',
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
          currentCellCertificate: {
            cellMark: 'A-1001',
            specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
            inCellSanitation: false,
            maxCapacity: 2,
            workingCapacity: 1,
            certifiedNormalAccommodation: 1,
          },
        }),
        LocationFactory.build({
          id: 'id2',
          pathHierarchy: 'A-1-002',
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
          currentCellCertificate: {
            cellMark: 'A-1002',
            specialistCellTypes: [],
            inCellSanitation: true,
            maxCapacity: 3,
            workingCapacity: 2,
            certifiedNormalAccommodation: 1,
          },
        }),
      ]

      context('Without a signed op cap change', () => {
        let page: SubmitCertificationApprovalRequestPage

        beforeEach(() => {
          location = LocationFactory.build({
            active: false,
            inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
            locationType: 'LANDING',
            leafLevel: false,
          })
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation: location,
            subLocations,
          })
          LocationsApiStubber.stub.stubLocations(location)
          LocationsApiStubber.stub.stubLocations(subLocations[0])
          LocationsApiStubber.stub.stubLocations(subLocations[1])
          LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
          LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
          LocationsApiStubber.stub.stubLocationsRequestPermanentDeactivation()
          LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
          LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
          cy.task('setFeatureFlag', { archiveLocation: true })
          cy.signIn()

          ViewLocationsShowPage.goTo(location.prisonId, location.id)
          const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
          viewLocationsShowPage.archiveLandingButton().click()
          const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
          disclaimerPage.continueButton().click()
          const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
          reasonPage.submit(multilineText)
          const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
          isUpdateNeeded.submit({ updateNeeded: false })
          page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        })

        it('has a cancel link', () => {
          page.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a back link', () => {
          page.backLink().click()

          Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
        })

        context('validation errors', () => {
          it('displays the correct error(s) for required', () => {
            page.submit({})

            Page.checkForError(
              'submit-certification-approval-request_confirmation',
              'Confirm that the cells meet the certification standards',
            )
          })
        })

        it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
          page.submit({
            confirm: true,
          })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

          Page.checkForSuccessBanner(
            'Change request sent',
            'You have submitted a request to update the cell certificate.',
          )
        })

        it('displays the correct change summary', () => {
          const rowsSelector = '[data-qa="overview-list-PERMANENT_DEACTIVATION"] .govuk-summary-list__value'
          cy.get(rowsSelector).eq(0).contains('A-1-001')
          cy.get(rowsSelector).eq(1).contains('Archive location')

          const cellTypeTableSelector = '[data-qa="locations-table"]'
          const cellTypeHeaderSelector = `${cellTypeTableSelector} .govuk-table__header`
          cy.get(cellTypeHeaderSelector).eq(0).contains('Location')
          cy.get(cellTypeHeaderSelector).eq(1).contains('Door number')
          cy.get(cellTypeHeaderSelector).eq(2).contains('Baseline CNA')
          cy.get(cellTypeHeaderSelector).eq(3).contains('Certified working capacity')
          cy.get(cellTypeHeaderSelector).eq(4).contains('Maximum capacity')
          cy.get(cellTypeHeaderSelector).eq(5).contains('Cell type')
          cy.get(cellTypeHeaderSelector).eq(6).contains('Sanitation')

          const cellTypeRowsSelector = `${cellTypeTableSelector} .govuk-table__body .govuk-table__row`
          // Row 1
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(0).contains('A-1-001')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(1).contains('A-1001')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(2).contains('1')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(3).contains('1')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(4).contains('2')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(5).contains('Biohazard / dirty protest cell')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(6).contains('No')
          // Row 2
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(0).contains('A-1-002')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(1).contains('A-1002')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(2).contains('1')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(3).contains('2')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(4).contains('3')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(5).contains('-')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(6).contains('Yes')
        })
      })

      context('With a signed op cap change', () => {
        let page: SubmitCertificationApprovalRequestPage

        beforeEach(() => {
          location = LocationFactory.build({
            active: false,
            inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
            locationType: 'LANDING',
            leafLevel: false,
          })
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation: location,
            subLocations,
          })
          LocationsApiStubber.stub.stubLocations(location)
          LocationsApiStubber.stub.stubLocations(subLocations[0])
          LocationsApiStubber.stub.stubLocations(subLocations[1])
          LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
          LocationsApiStubber.stub.stubPendingApprovalsBelow({ hasPendingBelow: false, pendingLocations: [] })
          LocationsApiStubber.stub.stubLocationsRequestPermanentDeactivation()
          LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
          LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
          cy.task('setFeatureFlag', { archiveLocation: true })
          cy.signIn()

          ViewLocationsShowPage.goTo(location.prisonId, location.id)
          const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
          viewLocationsShowPage.archiveLandingButton().click()
          const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
          disclaimerPage.continueButton().click()
          const reasonPage = Page.verifyOnPage(ArchiveReasonPage)
          reasonPage.submit(multilineText)
          const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
          isUpdateNeeded.submit({ updateNeeded: true })
          const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
          detailsPage.submit({ opCap: 9, explanation: 'Op cap update was needed' })
          page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        })

        it('has a cancel link', () => {
          page.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a back link', () => {
          page.backLink().click()

          Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
        })

        it('displays the correct change summaries', () => {
          cy.get('[data-qa="approval-request-PERMANENT_DEACTIVATION"] h2').contains('Change 1 - Archive location')
          const rowsSelector = '[data-qa="overview-list-PERMANENT_DEACTIVATION"] .govuk-summary-list__value'
          cy.get(rowsSelector).eq(0).contains('A-1-001')
          cy.get(rowsSelector).eq(1).contains('Archive location')

          const cellTypeTableSelector = '[data-qa="locations-table"]'
          const cellTypeHeaderSelector = `${cellTypeTableSelector} .govuk-table__header`
          cy.get(cellTypeHeaderSelector).eq(0).contains('Location')
          cy.get(cellTypeHeaderSelector).eq(1).contains('Door number')
          cy.get(cellTypeHeaderSelector).eq(2).contains('Baseline CNA')
          cy.get(cellTypeHeaderSelector).eq(3).contains('Certified working capacity')
          cy.get(cellTypeHeaderSelector).eq(4).contains('Maximum capacity')
          cy.get(cellTypeHeaderSelector).eq(5).contains('Cell type')
          cy.get(cellTypeHeaderSelector).eq(6).contains('Sanitation')

          const cellTypeRowsSelector = `${cellTypeTableSelector} .govuk-table__body .govuk-table__row`
          // Row 1
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(0).contains('A-1-001')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(1).contains('A-1001')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(2).contains('1')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(3).contains('1')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(4).contains('2')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(5).contains('Biohazard / dirty protest cell')
          cy.get(cellTypeRowsSelector).eq(0).find('.govuk-table__cell').eq(6).contains('No')
          // Row 2
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(0).contains('A-1-002')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(1).contains('A-1002')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(2).contains('1')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(3).contains('2')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(4).contains('3')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(5).contains('-')
          cy.get(cellTypeRowsSelector).eq(1).find('.govuk-table__cell').eq(6).contains('Yes')

          cy.get('[data-qa="approval-request-SIGNED_OP_CAP"] h2').contains(
            'Change 2 - Change signed operational capacity',
          )
          const opCapRowsSelector = '[data-qa="overview-list-SIGNED_OP_CAP"] .govuk-summary-list__value'
          cy.get(opCapRowsSelector).eq(0).contains('TST')
          cy.get(opCapRowsSelector).eq(1).contains('Change signed operational capacity')
          cy.get(opCapRowsSelector).eq(2).contains('Op cap update was needed')

          const opCapChangesTableSelector = '[data-qa="cap-change-table"]'
          const opCapChangesDataSelector = `${opCapChangesTableSelector} .govuk-table__cell`
          cy.get(opCapChangesDataSelector).eq(0).contains('TST')
          cy.get(opCapChangesDataSelector).eq(1).contains('10 → 9')
        })

        context('validation errors', () => {
          it('displays the correct error(s) for required', () => {
            page.submit({})

            Page.checkForError(
              'submit-certification-approval-request_confirmation',
              'Confirm that the cells meet the certification standards',
            )
          })
        })

        it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
          page.submit({
            confirm: true,
          })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

          Page.checkForSuccessBanner(
            'Change requests sent',
            'You have submitted 2 requests to update the cell certificate.',
          )
        })
      })
    })
  })
})
