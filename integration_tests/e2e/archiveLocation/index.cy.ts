import LocationFactory from '../../../server/testutils/factories/location'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import Page from '../../pages/page'
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
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
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
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
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
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
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
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
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
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
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

    describe('cert disclaimer page', () => {
      beforeEach(() => {
        location = LocationFactory.build({
          active: false,
          inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
          locationType: 'CELL',
        })
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
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

      it('has a continue button leads to the reason page', () => {
        const disclaimerPage = new CertChangeDisclaimerPage('Archiving a location')
        disclaimerPage.continueButton().click()
        cy.location('pathname').should('contain', '/archive/reason')
      })
    })
  })
})
