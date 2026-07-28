import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeCellTypePage from '../../pages/changeCellType'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

context('Change cell type', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: null,
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
      })
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: [] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
      LocationsApiStubber.stub.stubLocations(location)
    })

    it('does not show the remove link on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeCellTypeLink().should('not.exist')
    })

    it('redirects user to sign in page if accessed directly', () => {
      cy.signIn()
      ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubUpdateSpecialistCellTypes()
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
    })

    context('when the cell is inactive', () => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        active: false,
        leafLevel: true,
        specialistCellTypes: ['ACCESSIBLE_CELL'],
        localName: null,
      })

      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
      })

      it('does not show the change cell type link when the cell is inactive', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellTypeLink().should('not.exist')
      })
    })

    context('when the cell is active with normal cell type', () => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        active: true,
        leafLevel: true,
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
        localName: null,
      })

      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
      })

      it('can be accessed by clicking the change cell type link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellTypeLink().click()

        Page.verifyOnPage(ChangeCellTypePage)
      })

      it('pre-selects the existing cell types', () => {
        ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const typePage = Page.verifyOnPage(ChangeCellTypePage)
        typePage.cellTypeCheckbox('ACCESSIBLE_CELL').should('be.checked')
        typePage.cellTypeCheckbox('CONSTANT_SUPERVISION').should('be.checked')
        typePage.cellTypeCheckbox('NORMAL_ACCOMMODATION').should('not.be.checked')
      })

      it('shows the correct validation error when no normal type is selected', () => {
        ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const typePage = Page.verifyOnPage(ChangeCellTypePage)

        typePage.submitNormal({ types: [] })

        Page.checkForError('specialistCellTypes', 'Select a cell type')
      })

      it('shows the success banner when the change is complete', () => {
        ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const typePage = Page.verifyOnPage(ChangeCellTypePage)

        typePage.submitNormal({ types: ['NORMAL_ACCOMMODATION'] })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Cell type changed', 'You have changed the normal cell type for this location.')
      })
    })

    context('when the cell is active with special cell type', () => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        active: true,
        leafLevel: true,
        specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
        localName: null,
      })

      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
      })

      it('can be accessed by clicking the change cell type link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellTypeLink().click()

        Page.verifyOnPage(ChangeCellTypePage)
      })

      it('pre-selects the existing cell type', () => {
        ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const typePage = Page.verifyOnPage(ChangeCellTypePage)
        typePage.cellTypeRadio('BIOHAZARD_DIRTY_PROTEST').should('be.checked')
      })

      it('shows the success banner when the change is complete', () => {
        ChangeCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const typePage = Page.verifyOnPage(ChangeCellTypePage)

        typePage.submitSpecial('BIOHAZARD_DIRTY_PROTEST')

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner(
          'Special cell type changed',
          'You have changed the special cell type for this location.',
        )
      })
    })
  })
})
