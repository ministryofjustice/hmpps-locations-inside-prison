import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ConfirmRemoveCellTypePage from '../../pages/removeCellType/confirm'
import CheckRemoveCellTypePage from '../../pages/removeCellType/check'
import RemoveCellTypePage from '../../pages/removeCellType/remove'
import ReviewCellCapacityPage from '../../pages/removeCellType/review'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Remove cell type', () => {
  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: '1-1-001',
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
      })
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['VIEW_INTERNAL_LOCATION'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
    })

    it('does not show the remove link on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeSpecificCellTypeLink().should('not.exist')
    })

    it('redirects user to sign in page if accessed directly', () => {
      cy.signIn()
      RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
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

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubUpdateCapacity')
      cy.task('stubUpdateSpecialistCellTypes')
      cy.task('stubPrisonerLocationsId', prisonerLocations)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
    })

    it('does not show the remove cell type link when the cell is inactive', () => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        active: false,
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: '1-1-001',
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.signIn()
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)

      viewLocationsShowPage.removeSpecificCellTypeLink().should('not.exist')
    })

    context('when the working capacity is >= 1', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          leafLevel: true,
          localName: '1-1-001',
          specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.signIn()
      })

      it('can be accessed by clicking the remove link on the show location page', () => {
        ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.removeSpecificCellTypeLink().click()

        Page.verifyOnPage(RemoveCellTypePage)
      })

      it('has a back link to the show location page', () => {
        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const removeCellTypePage = Page.verifyOnPage(RemoveCellTypePage)
        removeCellTypePage.backLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a cancel link', () => {
        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const removeCellTypePage = Page.verifyOnPage(RemoveCellTypePage)

        removeCellTypePage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has the correct main heading and a caption showing the cell description', () => {
        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        Page.verifyOnPage(RemoveCellTypePage)

        cy.get('h1').contains('Are you sure you want to remove all of the specific cell types?')
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('has the correct main heading when only one cell type', () => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          leafLevel: true,
          localName: '1-1-001',
          specialistCellTypes: ['ACCESSIBLE_CELL'],
        })
        cy.task('stubLocations', location)

        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        Page.verifyOnPage(RemoveCellTypePage)

        cy.get('h1').contains('Are you sure you want to remove the specific cell type?')
      })

      it('shows the list of current cell types', () => {
        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        Page.verifyOnPage(RemoveCellTypePage)

        cy.contains('Cell types: Accessible cell, Constant Supervision Cell')
      })

      it('shows the success banner when the change is complete', () => {
        RemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const removeCellTypePage = Page.verifyOnPage(RemoveCellTypePage)
        removeCellTypePage.removeCellTypeButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell type removed')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have removed the specific cell type for this location.',
        )
      })
    })

    context('when the working capacity is zero', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          capacity: {
            maxCapacity: 3,
            workingCapacity: 0,
          },
          leafLevel: true,
          localName: '1-1-001',
          specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
        })
        cy.task('stubLocationsLocationsResidentialSummary', {
          prisonSummary: {
            workingCapacity: 8,
            signedOperationalCapacity: 10,
            maxCapacity: 11,
          },
        })
        cy.task('stubLocations', location)
        cy.signIn()
      })

      describe('are you sure page', () => {
        it('can be accessed by clicking the remove link on the show location page', () => {
          const location = LocationFactory.build({
            accommodationTypes: ['NORMAL_ACCOMMODATION'],
            capacity: {
              maxCapacity: 3,
              workingCapacity: 0,
            },
            leafLevel: true,
            localName: '1-1-001',
            specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
          })
          cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
          ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
          const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
          viewLocationsShowPage.removeSpecificCellTypeLink().click()

          Page.verifyOnPage(CheckRemoveCellTypePage)
        })

        it('has a back link to the show location page', () => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)
          checkRemoveCellTypePage.backLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a cancel link', () => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

          checkRemoveCellTypePage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has the correct main heading and a caption showing the cell description', () => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          Page.verifyOnPage(CheckRemoveCellTypePage)

          cy.get('h1').contains('Are you sure you want to remove all of the specific cell types?')
          cy.get('.govuk-caption-m').contains('1-1-001')
        })

        it('has the correct main heading when only one cell type', () => {
          const location = LocationFactory.build({
            accommodationTypes: ['NORMAL_ACCOMMODATION'],
            capacity: {
              maxCapacity: 3,
              workingCapacity: 0,
            },
            leafLevel: true,
            localName: '1-1-001',
            specialistCellTypes: ['ACCESSIBLE_CELL'],
          })
          cy.task('stubLocations', location)

          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          Page.verifyOnPage(CheckRemoveCellTypePage)

          cy.get('h1').contains('Are you sure you want to remove the specific cell type?')
        })

        it('shows the correct validation error when nothing is selected', () => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

          checkRemoveCellTypePage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Select yes if you want to remove the specific cell types')
          cy.get('#areYouSure-error').contains('Select yes if you want to remove the specific cell types')
        })

        it('shows the correct validation error when nothing is selected and there is only one type', () => {
          const location = LocationFactory.build({
            accommodationTypes: ['NORMAL_ACCOMMODATION'],
            capacity: {
              maxCapacity: 3,
              workingCapacity: 0,
            },
            leafLevel: true,
            localName: '1-1-001',
            specialistCellTypes: ['ACCESSIBLE_CELL'],
          })
          cy.task('stubLocations', location)

          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

          checkRemoveCellTypePage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains(/Select yes if you want to remove the specific cell type\s*$/)
          cy.get('#areYouSure-error').contains(/Select yes if you want to remove the specific cell type\s*$/)
        })

        it('redirects to the show location page when no is selected', () => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

          checkRemoveCellTypePage.noCheckbox().click()
          checkRemoveCellTypePage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })

      describe('review cell capacity page', () => {
        beforeEach(() => {
          CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

          checkRemoveCellTypePage.yesCheckbox().click()
          checkRemoveCellTypePage.continueButton().click()

          Page.verifyOnPage(ReviewCellCapacityPage)
        })

        it('has the correct warning text', () => {
          cy.get('.govuk-warning-text__text').contains('The cell’s working capacity must be more than 0.')
        })

        it('has the correct inset text', () => {
          cy.get('.govuk-inset-text').contains(
            'Cells used as normal accommodation that don’t have a specific cell type must have a working capacity of at least 1.',
          )
        })

        it('has the correct hint text on the fields', () => {
          cy.get('#workingCapacity-hint').contains(
            'The number of people that can currently live in this location based on available beds, furniture and sanitation.',
          )
          cy.get('#maxCapacity-hint').contains(
            'The maximum number of people that could potentially live in this location.',
          )
        })

        it('has a back link to the are you sure page', () => {
          const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)
          reviewCellCapacityPage.backLink().click()

          Page.verifyOnPage(CheckRemoveCellTypePage)
        })

        it('has a cancel link', () => {
          const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)
          reviewCellCapacityPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        describe('validations', () => {
          it('shows the correct validation error when missing working capacity', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear()
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
            cy.get('#workingCapacity-error').contains('Enter a working capacity')
          })

          it('shows the correct validation error when working capacity > 99', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear().type('100')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
            cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
          })

          it('shows the correct validation error when working capacity is not a number', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear().type('hello')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
            cy.get('#workingCapacity-error').contains('Working capacity must be a number')
          })

          it('shows the correct validation error when working capacity is greater than max capacity', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('3')
            reviewCellCapacityPage.workingCapacityInput().clear().type('4')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
            cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
          })

          it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('3')
            reviewCellCapacityPage.workingCapacityInput().clear().type('0')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
            cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
          })

          it('shows the correct validation error when missing max capacity', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear()
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Enter a maximum capacity')
            cy.get('#maxCapacity-error').contains('Enter a maximum capacity')
          })

          it('shows the correct validation error when max capacity is zero', () => {
            const location = LocationFactory.build({
              accommodationTypes: ['NORMAL_ACCOMMODATION'],
              capacity: {
                maxCapacity: 3,
                workingCapacity: 3,
              },
              leafLevel: true,
              specialistCellTypes: ['ACCESSIBLE_CELL'],
              localName: '1-1-001',
            })
            cy.task('stubLocations', location)
            cy.task('stubPrisonerLocationsId', [])

            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('0')
            reviewCellCapacityPage.workingCapacityInput().clear().type('0')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
            cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
          })

          it('shows the correct validation error when max capacity is zero and below occupancy', () => {
            const location = LocationFactory.build({
              accommodationTypes: ['NORMAL_ACCOMMODATION'],
              capacity: {
                maxCapacity: 3,
                workingCapacity: 3,
              },
              leafLevel: true,
              specialistCellTypes: ['ACCESSIBLE_CELL'],
              localName: '1-1-001',
            })
            cy.task('stubLocations', location)

            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('0')
            reviewCellCapacityPage.workingCapacityInput().clear().type('0')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
            cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
          })

          it('shows the correct validation error when max capacity > 99', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('100')
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be more than 99')
            cy.get('#maxCapacity-error').contains('Maximum capacity cannot be more than 99')
          })

          it('shows the correct validation error when max capacity is not a number', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('hello')
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity must be a number')
            cy.get('#maxCapacity-error').contains('Maximum capacity must be a number')
          })

          it('shows the correct validation errors when max capacity is less than current occupancy', () => {
            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.maxCapacityInput().clear().type('1')
            reviewCellCapacityPage.workingCapacityInput().clear().type('1')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains(
              'Maximum capacity cannot be less than the number of people currently occupying the cell',
            )
            cy.get('.govuk-error-summary__list').contains(
              'Working capacity cannot be less than the number of people currently occupying the cell',
            )
            cy.get('#maxCapacity-error').contains(
              'Maximum capacity cannot be less than the number of people currently occupying the cell',
            )
            cy.get('#workingCapacity-error').contains(
              'Working capacity cannot be less than the number of people currently occupying the cell',
            )
          })
        })
      })

      describe('confirm updates page', () => {
        context('when changing one value', () => {
          beforeEach(() => {
            CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
            const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

            checkRemoveCellTypePage.yesCheckbox().click()
            checkRemoveCellTypePage.continueButton().click()

            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('3')
            reviewCellCapacityPage.continueButton().click()
          })

          it('has a back link to the review cell capacity page', () => {
            const confirmRemoveCellTypePage = Page.verifyOnPage(ConfirmRemoveCellTypePage)
            confirmRemoveCellTypePage.backLink().click()

            Page.verifyOnPage(ReviewCellCapacityPage)
          })

          it('has a change link that leads back to the review cell capacity page', () => {
            const confirmRemoveCellTypePage = Page.verifyOnPage(ConfirmRemoveCellTypePage)
            confirmRemoveCellTypePage.changeLink().click()

            Page.verifyOnPage(ReviewCellCapacityPage)
          })

          it('has a cancel link', () => {
            const confirmRemoveCellTypePage = Page.verifyOnPage(ConfirmRemoveCellTypePage)
            confirmRemoveCellTypePage.cancelLink().click()

            Page.verifyOnPage(ViewLocationsShowPage)
          })

          it('shows the correct change summary', () => {
            Page.verifyOnPage(ConfirmRemoveCellTypePage)

            cy.get('.change-summary h2').contains('Change to establishment capacity')
            cy.get('.change-summary p').contains(
              /^This will increase the establishment’s working capacity from 8 to 10.$/,
            )
          })

          it('shows the success banner on completion', () => {
            const location = LocationFactory.build({
              accommodationTypes: ['NORMAL_ACCOMMODATION'],
              capacity: {
                maxCapacity: 3,
                workingCapacity: 0,
              },
              leafLevel: true,
              localName: '1-1-001',
              specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
            })
            cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
            const confirmRemoveCellTypePage = Page.verifyOnPage(ConfirmRemoveCellTypePage)
            confirmRemoveCellTypePage.updateCellButton().click()

            Page.verifyOnPage(ViewLocationsShowPage)
            cy.get('#govuk-notification-banner-title').contains('Success')
            cy.get('.govuk-notification-banner__content h3').contains('Cell updated')
            cy.get('.govuk-notification-banner__content p').contains(
              'You have removed the cell type and updated the capacity for this location.',
            )
          })
        })

        context('when changing both values', () => {
          beforeEach(() => {
            CheckRemoveCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
            const checkRemoveCellTypePage = Page.verifyOnPage(CheckRemoveCellTypePage)

            checkRemoveCellTypePage.yesCheckbox().click()
            checkRemoveCellTypePage.continueButton().click()

            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()
          })

          it('shows the correct change summary when changing both values', () => {
            Page.verifyOnPage(ConfirmRemoveCellTypePage)

            cy.get('.change-summary h2').contains('Change to establishment capacity')
            cy.get('.change-summary p').contains(
              /^This will increase the establishment’s working capacity from 8 to 10./,
            )
            cy.get('.change-summary p').contains(
              /This will decrease the establishment’s maximum capacity from 11 to 10.$/,
            )
          })
        })
      })
    })
  })
})
