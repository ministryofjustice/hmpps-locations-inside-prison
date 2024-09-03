import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import ChangeSignedOperationalCapacityPage from '../../pages/changeSignedOperationalCapacity'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Change signed operational capacity', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
    })

    it('redirects user to sign in page', () => {
      cy.signIn()
      ChangeSignedOperationalCapacityPage.goTo('TST')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    const residentialSummary = {
      prisonSummary: {
        workingCapacity: 8,
        signedOperationalCapacity: 12,
        maxCapacity: 15,
      },
      subLocationName: 'TestWings',
      subLocations: [
        LocationFactory.build(),
        LocationFactory.build({
          id: '7e570000-0000-0000-0000-000000000002',
          pathHierarchy: 'A-1-002',
          localName: undefined,
          code: '002',
          inactiveCells: 1,
          capacity: { maxCapacity: 3, workingCapacity: 1 },
          status: 'INACTIVE',
        }),
      ],
      topLevelLocationType: 'Wings',
      locationHierarchy: [],
    }

    const signedOperationalCapacity = {
      signedOperationCapacity: 12,
      prisonId: 'TST',
      whenUpdated: '2024-07-05T10:35:17',
      updatedBy: 'USERNAME',
    }

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
      cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
      cy.task('stubSignedOperationalCapacityGet', signedOperationalCapacity)
      cy.task('stubSignedOperationalCapacityUpdate')
      cy.signIn()
    })

    it('can be accessed by clicking the change signed operational capacity link on the show location index page', () => {
      ViewLocationsShowPage.goTo('TST')
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.capacity.signedOperationalChangeLink().click()

      Page.verifyOnPage(ChangeSignedOperationalCapacityPage)
    })

    it('has a back link to the show location index page', () => {
      ChangeSignedOperationalCapacityPage.goTo('TST')
      const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)
      changeSignedOperationalCapacityPage.backLink().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has the correct main heading', () => {
      ChangeSignedOperationalCapacityPage.goTo('TST')

      cy.get('h1').contains('Change signed operational capacity')
    })

    it('shows the correct current signed operational capacity and updated by summary', () => {
      ChangeSignedOperationalCapacityPage.goTo('TST')

      cy.get('.current-signed-operational-capacity-summary h2').contains('Current signed operational capacity')
      cy.get('.current-signed-operational-capacity-summary p').contains('12')
      cy.get('.current-signed-operational-capacity-summary p').contains(
        'Last updated by john smith on Friday 5 July 2024 at 10:35',
      )
    })

    it('shows 0 and no last update row when sign op cap not found', () => {
      cy.task('stubSignedOperationalCapacityGetNotFound')

      ChangeSignedOperationalCapacityPage.goTo('TST')

      cy.get('.current-signed-operational-capacity-summary h2').contains('Current signed operational capacity')
      cy.get('.current-signed-operational-capacity-summary p').contains('0')
      cy.get('.current-signed-operational-capacity-summary p').contains('Last updated by').should('not.exist')
    })

    it('has a cancel link', () => {
      ChangeSignedOperationalCapacityPage.goTo('TST')
      const changeSignedOperationalPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)
      changeSignedOperationalPage.cancelLink().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('shows the success banner when the change is complete', () => {
      ChangeSignedOperationalCapacityPage.goTo('TST')
      const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)
      changeSignedOperationalCapacityPage.newSignedOperationalCapacityInput().clear().type('10')
      changeSignedOperationalCapacityPage.prisonGovernorApprovalInput().check()
      changeSignedOperationalCapacityPage.continueButton().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Signed operational capacity updated')
      cy.get('.govuk-notification-banner__content p').contains(
        "You have updated the establishment's signed operational capacity.",
      )
    })

    describe('validations', () => {
      it('shows the correct validation error when missing signed operational capacity', () => {
        ChangeSignedOperationalCapacityPage.goTo('TST')
        const changeSigndOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)

        changeSigndOperationalCapacityPage.newSignedOperationalCapacityInput().clear()
        changeSigndOperationalCapacityPage.prisonGovernorApprovalInput().check()
        changeSigndOperationalCapacityPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a new signed operational capacity')
        cy.get('#newSignedOperationalCapacity-error').contains('Enter a new signed operational capacity')
      })

      it('shows the correct validation error when new signed operational capacity is not a number', () => {
        ChangeSignedOperationalCapacityPage.goTo('TST')
        const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)

        changeSignedOperationalCapacityPage.newSignedOperationalCapacityInput().clear().type('hello')
        changeSignedOperationalCapacityPage.prisonGovernorApprovalInput().check()
        changeSignedOperationalCapacityPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('New signed operational capacity must be a number')
        cy.get('#newSignedOperationalCapacity-error').contains('New signed operational capacity must be a number')
      })

      it('shows the correct validation error when prisoner governor approval is missing', () => {
        ChangeSignedOperationalCapacityPage.goTo('TST')
        const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)

        changeSignedOperationalCapacityPage.newSignedOperationalCapacityInput().clear().type('10')
        changeSignedOperationalCapacityPage.prisonGovernorApprovalInput().uncheck()
        changeSignedOperationalCapacityPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Confirm that the prison governor has approved this change')
        cy.get('#prisonGovernorApproval-error').contains('Confirm that the prison governor has approved this change')
      })

      it('shows the correct validation error when new signed operational capacity is greater than max capacity', () => {
        ChangeSignedOperationalCapacityPage.goTo('TST')
        const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)

        changeSignedOperationalCapacityPage.newSignedOperationalCapacityInput().clear().type('16')
        changeSignedOperationalCapacityPage.prisonGovernorApprovalInput().check()
        changeSignedOperationalCapacityPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains(
          "New signed operational capacity cannot be more than the establishment's maximum capacity",
        )
        cy.get('#newSignedOperationalCapacity-error').contains(
          "New signed operational capacity cannot be more than the establishment's maximum capacity",
        )
      })

      it('redirects back to the view locations index page when there is no change', () => {
        ChangeSignedOperationalCapacityPage.goTo('TST')
        const changeSignedOperationalCapacityPage = Page.verifyOnPage(ChangeSignedOperationalCapacityPage)

        changeSignedOperationalCapacityPage.newSignedOperationalCapacityInput().clear().type('12')
        changeSignedOperationalCapacityPage.prisonGovernorApprovalInput().check()
        changeSignedOperationalCapacityPage.continueButton().click()

        Page.verifyOnPage(ViewLocationsIndexPage)
      })
    })
  })
})
