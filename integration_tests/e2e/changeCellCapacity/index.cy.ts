import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import ChangeCellCapacityPage from '../../pages/changeCellCapacity'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import LocationsApiStubber from '../../mockApis/locationsApi'
import AuthStubber from '../../mockApis/auth'

context('Change cell capacity', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    it('redirects user to sign in page', () => {
      cy.signIn()
      ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    const location = LocationFactory.build({
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      capacity: {
        maxCapacity: 3,
        workingCapacity: 3,
      },
      leafLevel: true,
      specialistCellTypes: [],
      localName: '1-1-001',
    })

    const prisonerLocations = [
      {
        cellLocation: '1-1-001',
        prisoners: [
          {
            prisonerNumber: 'A1234AA',
            prisonId: 'TST',
            prisonName: 'HMP Leeds',
            cellLocation: '1-1-001',
            firstName: 'Dave',
            lastName: 'Jones',
            gender: 'Male',
            csra: 'High',
            category: 'C',
            alerts: [
              {
                alertType: 'X',
                alertCode: 'XA',
                active: true,
                expired: false,
              },
            ],
          },
          {
            prisonerNumber: 'B1234BB',
            prisonId: 'TST',
            prisonName: 'HMP Leeds',
            cellLocation: '1-1-001',
            firstName: 'Horatio',
            lastName: 'McBubblesworth',
            gender: 'Male',
            csra: 'High',
            category: 'C',
            alerts: [
              {
                alertType: 'X',
                alertCode: 'XA',
                active: true,
                expired: false,
              },
            ],
          },
        ],
      },
    ]

    context('when certificationApprovalRequired is INACTIVE', () => {
      beforeEach(() => {
        cy.task('reset')
        AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
        ManageUsersApiStubber.stub.stubManageUsers()
        ManageUsersApiStubber.stub.stubManageUsersMe()
        ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
        LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
        LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
        LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
        LocationsApiStubber.stub.stubLocationsConstantsLocationType()
        LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
        LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubPrisonerLocationsId(prisonerLocations)
        LocationsApiStubber.stub.stubUpdateCapacity()
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
        cy.signIn()
      })

      it('can be accessed by clicking the change working capacity link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.summaryCards.workingCapacityChangeLink().click()

        Page.verifyOnPage(ChangeCellCapacityPage)
      })

      it('can be accessed by clicking the change maximum capacity link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.summaryCards.maximumCapacityChangeLink().click()

        Page.verifyOnPage(ChangeCellCapacityPage)
      })

      it('has a back link to the show location page', () => {
        ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
        const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
        changeCellCapacityPage.backLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has the correct main heading and a caption showing the cell description', () => {
        ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')

        cy.get('h1').contains('Change cell capacity')
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('has a cancel link', () => {
        ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
        const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
        changeCellCapacityPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      describe('validations', () => {
        it('shows the correct validation error when missing working capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.workingCapacityInput().clear()
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
          cy.get('#workingCapacity-error').contains('Enter a working capacity')
        })

        it('shows the correct validation error when working capacity > 99', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.workingCapacityInput().clear().type('100')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
        })

        it('shows the correct validation error when working capacity is not a number', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.workingCapacityInput().clear().type('hello')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
          cy.get('#workingCapacity-error').contains('Working capacity must be a number')
        })

        it('shows the correct validation error when working capacity is greater than max capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
        })

        it('shows the correct validation error when working capacity is zero for normal accommodation cell', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a normal accommodation cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a normal accommodation cell')
        })

        it('shows the correct validation error when missing max capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear()
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a maximum capacity')
          cy.get('#maxCapacity-error').contains('Enter a maximum capacity')
        })

        it('shows the correct validation error when max capacity > 99', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('100')
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be more than 99')
          cy.get('#maxCapacity-error').contains('Maximum capacity cannot be more than 99')
        })

        it('shows the correct validation error when max capacity is not a number', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('hello')
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity must be a number')
          cy.get('#maxCapacity-error').contains('Maximum capacity must be a number')
        })

        it('shows the correct validation error when max capacity is zero', () => {
          cy.task(
            'stubLocations',
            LocationFactory.build({
              accommodationTypes: ['NORMAL_ACCOMMODATION'],
              capacity: {
                maxCapacity: 3,
                workingCapacity: 3,
              },
              leafLevel: true,
              specialistCellTypes: ['ACCESSIBLE_CELL'],
              localName: '1-1-001',
            }),
          )
          cy.task('stubPrisonerLocationsId', [])

          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('0')
          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
          cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
        })

        it('shows the correct validation error when max capacity is zero and below occupancy', () => {
          cy.task(
            'stubLocations',
            LocationFactory.build({
              accommodationTypes: ['NORMAL_ACCOMMODATION'],
              capacity: {
                maxCapacity: 3,
                workingCapacity: 3,
              },
              leafLevel: true,
              specialistCellTypes: ['ACCESSIBLE_CELL'],
              localName: '1-1-001',
            }),
          )

          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('0')
          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
          cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
        })

        it('shows the correct validation errors when max capacity is less than current occupancy', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('1')
          changeCellCapacityPage.workingCapacityInput().clear().type('1')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains(
            'Maximum capacity cannot be less than the number of people currently occupying the cell',
          )
          cy.get('#maxCapacity-error').contains(
            'Maximum capacity cannot be less than the number of people currently occupying the cell',
          )
        })

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })
    })

    context('when certificationApprovalRequired is ACTIVE', () => {
      beforeEach(() => {
        location.status = 'DRAFT'
        location.pendingChanges = {
          maxCapacity: 3,
          workingCapacity: 3,
          certifiedNormalAccommodation: 3,
        }

        cy.task('reset')
        AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
        ManageUsersApiStubber.stub.stubManageUsers()
        ManageUsersApiStubber.stub.stubManageUsersMe()
        ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
        LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
        LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
        LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
        LocationsApiStubber.stub.stubLocationsConstantsLocationType()
        LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
        LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
        LocationsApiStubber.stub.stubLocations(location)
        LocationsApiStubber.stub.stubLocations(
          LocationFactory.build({
            id: '57718979-573c-433a-9e51-2d83f887c11c',
            parentId: undefined,
            topLevelId: undefined,
          }),
        )
        LocationsApiStubber.stub.stubPrisonerLocationsId(prisonerLocations)
        LocationsApiStubber.stub.stubUpdateCapacity()
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
        cy.signIn()
      })

      it('can be accessed by clicking the change CNA link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.summaryCards.cnaChangeLink().click()

        Page.verifyOnPage(ChangeCellCapacityPage)
      })

      describe('validations', () => {
        it('shows the correct validation error when missing cna', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear()
          changeCellCapacityPage.saveButton().click()

          changeCellCapacityPage.checkForError('baselineCna', 'Enter a baseline certified normal accommodation (CNA)')
        })

        it('shows the correct validation error when cna > 99', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear().type('100')
          changeCellCapacityPage.saveButton().click()

          changeCellCapacityPage.checkForError(
            'baselineCna',
            'Baseline certified normal accommodation (CNA) cannot be more than 99',
          )
        })

        it('shows the correct validation error when cna > max capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear().type('6')
          changeCellCapacityPage.saveButton().click()

          changeCellCapacityPage.checkForError(
            'baselineCna',
            'Baseline certified normal accommodation (CNA) cannot be more than the maximum capacity',
          )
        })

        it('shows the correct validation error when cna is zero for normal accommodation cell', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear().type('0')
          changeCellCapacityPage.saveButton().click()

          changeCellCapacityPage.checkForError(
            'baselineCna',
            'Baseline certified normal accommodation (CNA) cannot be 0 for a normal accommodation cell',
          )
        })

        it('shows the correct validation error when cna is not a number', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear().type('abc')
          changeCellCapacityPage.saveButton().click()

          changeCellCapacityPage.checkForError(
            'baselineCna',
            'Baseline certified normal accommodation (CNA) must be a number',
          )
        })

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.cnaInput().clear().type('3')
          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.saveButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })

      it('completes the transaction without a confirm and shows a banner', () => {
        ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
        const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

        changeCellCapacityPage.cnaInput().clear().type('2')
        changeCellCapacityPage.maxCapacityInput().clear().type('2')
        changeCellCapacityPage.workingCapacityInput().clear().type('2')
        changeCellCapacityPage.saveButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Capacity updated')
        cy.get('.govuk-notification-banner__content p').contains('You have updated the capacity of 1-1-001.')
      })
    })
  })
})
