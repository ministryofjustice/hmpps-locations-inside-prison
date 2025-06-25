import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import ChangeCellCapacityPage from '../../pages/changeCellCapacity'
import ConfirmCellCapacityPage from '../../pages/confirmCellCapacity'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Change cell capacity', () => {
  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
    })

    it('redirects user to sign in page', () => {
      cy.signIn()
      ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('when the map2380 feature flag is disabled', () => {
    beforeEach(() => {
      cy.task('setFeatureFlag', { map2380: false })
    })

    context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
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
        cy.task('stubLocationsLocationsResidentialSummary')
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.task('stubPrisonerLocationsId', prisonerLocations)
        cy.task('stubUpdateCapacity')
        cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: false })
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

          changeCellCapacityPage.workingCapacityInput().clear()
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
          cy.get('#workingCapacity-error').contains('Enter a working capacity')
        })

        it('shows the correct validation error when working capacity > 99', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('100')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
        })

        it('shows the correct validation error when working capacity is not a number', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('hello')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
          cy.get('#workingCapacity-error').contains('Working capacity must be a number')
        })

        it('shows the correct validation error when working capacity is greater than max capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
        })

        it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
        })

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })

      describe('confirm cell capacity', () => {
        it('has a back link to the change cell capacity page', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.backLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('has a change link from the summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.changeLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('shows the correct summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)

          cy.get('.govuk-summary-list__key').eq(0).contains('Working capacity')
          cy.get('.govuk-summary-list__value').eq(0).contains('2')
          cy.get('.govuk-summary-list__key').eq(1).contains('Maximum capacity')
          cy.get('.govuk-summary-list__value').eq(1).contains('3')
        })

        it('shows the correct change summary when changing one value', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)

          cy.get('.change-summary h2').contains('Change to cell’s capacity')
          cy.get('.change-summary p').contains(/^You are decreasing the cell’s working capacity by 1./)
          cy.get('.change-summary p').contains(/This will decrease the establishment’s working capacity from 8 to 7.$/)
        })

        it('has a cancel link', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('shows the success banner when the change is complete', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.updateCellCapacityButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Capacity updated')
          cy.get('.govuk-notification-banner__content p').contains('You have updated the capacity of 1-1-001.')
        })
      })
    })
  })

  context('when the map2380 feature flag is enabled', () => {
    beforeEach(() => {
      cy.task('setFeatureFlag', { map2380: true })
    })

    context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
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

      beforeEach(() => {
        cy.task('reset')
        cy.task('stubSignIn', { roles: ['MANAGE_RESIDENTIAL_LOCATIONS'] })
        cy.task('stubManageUsers')
        cy.task('stubManageUsersMe')
        cy.task('stubManageUsersMeCaseloads')
        cy.task('stubLocationsConstantsAccommodationType')
        cy.task('stubLocationsConstantsConvertedCellType')
        cy.task('stubLocationsConstantsDeactivatedReason')
        cy.task('stubLocationsConstantsLocationType')
        cy.task('stubLocationsConstantsSpecialistCellType')
        cy.task('stubLocationsConstantsUsedForType')
        cy.task('stubLocationsLocationsResidentialSummary')
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.task('stubPrisonerLocationsId', prisonerLocations)
        cy.task('stubUpdateCapacity')
        cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
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

        cy.get('h1').contains('Change working capacity')
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

          changeCellCapacityPage.workingCapacityInput().clear()
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
          cy.get('#workingCapacity-error').contains('Enter a working capacity')
        })

        it('shows the correct validation error when working capacity > 99', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('100')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
        })

        it('shows the correct validation error when working capacity is not a number', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('hello')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
          cy.get('#workingCapacity-error').contains('Working capacity must be a number')
        })

        it('shows the correct validation error when working capacity is greater than max capacity', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
        })

        it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
        })

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })

      describe('confirm cell capacity', () => {
        it('has a back link to the change cell capacity page', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.backLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('has a change link from the summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.changeLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('shows the correct summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm working capacity - Residential locations')
          cy.get('h1').contains('Confirm working capacity')

          cy.get('.govuk-summary-list__key').eq(0).contains('Working capacity')
          cy.get('.govuk-summary-list__value').eq(0).contains('2')
          cy.get('.govuk-summary-list__key').eq(1).contains('Maximum capacity')
          cy.get('.govuk-summary-list__value').eq(1).contains('3')
        })

        it('shows the correct change summary when changing one value', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm working capacity - Residential locations')
          cy.get('h1').contains('Confirm working capacity')

          cy.get('.change-summary h2').contains('Change to working capacity')
          cy.get('.change-summary p').contains(/^You are decreasing the cell’s working capacity by 1./)
          cy.get('.change-summary p').contains(/This will decrease the establishment’s working capacity from 8 to 7.$/)
        })

        it('shows the correct change summary when changing both values', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm working capacity - Residential locations')
          cy.get('h1').contains('Confirm working capacity')

          cy.get('.change-summary h2').contains('Change to working capacity')
          cy.get('.change-summary p').contains(/^You are decreasing the cell’s working capacity by 1./)
          cy.get('.change-summary p').contains(/This will decrease the establishment’s working capacity from 8 to 7.$/)
        })

        it('has a cancel link', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('shows the success banner when the change is complete', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.updateWorkingCapacityButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Capacity updated')
          cy.get('.govuk-notification-banner__content p').contains('You have updated the capacity of 1-1-001.')
        })
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

      beforeEach(() => {
        cy.task('reset')
        cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
        cy.task('stubManageUsers')
        cy.task('stubManageUsersMe')
        cy.task('stubManageUsersMeCaseloads')
        cy.task('stubLocationsConstantsAccommodationType')
        cy.task('stubLocationsConstantsConvertedCellType')
        cy.task('stubLocationsConstantsDeactivatedReason')
        cy.task('stubLocationsConstantsLocationType')
        cy.task('stubLocationsConstantsSpecialistCellType')
        cy.task('stubLocationsConstantsUsedForType')
        cy.task('stubLocationsLocationsResidentialSummary')
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.task('stubPrisonerLocationsId', prisonerLocations)
        cy.task('stubUpdateCapacity')
        cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: false })
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

        it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
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

        it('redirects back to the view locations page when there is no change', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('3')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })
      })

      describe('confirm cell capacity', () => {
        it('has a back link to the change cell capacity page', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.backLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('has a change link from the summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.changeLink().click()

          Page.verifyOnPage(ChangeCellCapacityPage)
        })

        it('shows the correct summary list', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm cell capacity - Residential locations')
          cy.get('h1').contains('Confirm cell capacity')

          cy.get('.govuk-summary-list__key').eq(0).contains('Working capacity')
          cy.get('.govuk-summary-list__value').eq(0).contains('2')
          cy.get('.govuk-summary-list__key').eq(1).contains('Maximum capacity')
          cy.get('.govuk-summary-list__value').eq(1).contains('4')
        })

        it('shows the correct change summary when changing one value', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm cell capacity - Residential locations')
          cy.get('h1').contains('Confirm cell capacity')

          cy.get('.change-summary h2').contains('Change to cell’s capacity')
          cy.get('.change-summary p').contains(/^You are decreasing the cell’s working capacity by 1./)
          cy.get('.change-summary p').contains(/This will decrease the establishment’s working capacity from 8 to 7.$/)
        })

        it('shows the correct change summary when changing both values', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(ConfirmCellCapacityPage)
          cy.title().should('eq', 'Confirm cell capacity - Residential locations')
          cy.get('h1').contains('Confirm cell capacity')

          cy.get('.change-summary h2').contains('Change to cell’s capacity')
          cy.get('.change-summary p').contains(/^You are decreasing the cell’s working capacity by 1./)
          cy.get('.change-summary p').contains('This will decrease the establishment’s working capacity from 8 to 7.')
          cy.get('.change-summary p').contains('You are increasing the cell’s maximum capacity by 1')
          cy.get('.change-summary p').contains(/This will increase the establishment’s maximum capacity from 9 to 10.$/)
        })

        it('has a cancel link', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('shows the success banner when the change is complete', () => {
          ChangeCellCapacityPage.goTo('7e570000-0000-0000-0000-000000000001')
          const changeCellCapacityPage = Page.verifyOnPage(ChangeCellCapacityPage)
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.maxCapacityInput().clear().type('4')
          changeCellCapacityPage.continueButton().click()

          const confirmCellCapacityPage = Page.verifyOnPage(ConfirmCellCapacityPage)
          confirmCellCapacityPage.updateCellCapacityButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Capacity updated')
          cy.get('.govuk-notification-banner__content p').contains('You have updated the capacity of 1-1-001.')
        })
      })
    })
  })
})
