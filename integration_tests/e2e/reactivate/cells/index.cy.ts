import LocationFactory from '../../../../server/testutils/factories/location'
import Page, { PageElement } from '../../../pages/page'
import InactiveCellsIndexPage from '../../../pages/inactiveCells'
import ReactivateCellDetailsPage from '../../../pages/reactivate/cell/details'
import ReactivateCellsCheckCapacityPage from '../../../pages/reactivate/cells/checkCapacity'
import ReactivateCellsConfirmPage from '../../../pages/reactivate/cells/confirm'
import ReactivateCellsChangeCapacityPage from '../../../pages/reactivate/cells/changeCapacity'

context('Reactivate cells', () => {
  let locations: ReturnType<typeof LocationFactory.build>[]
  let inactiveParent: ReturnType<typeof LocationFactory.build>
  let inactiveParentParent: ReturnType<typeof LocationFactory.build>

  const genericLocation = LocationFactory.build({
    id: '57718979-573c-433a-9e51-2d83f887c11c',
    parentId: undefined,
    topLevelId: undefined,
  })

  const residentialSummary = {
    prisonSummary: {
      workingCapacity: 8,
      signedOperationalCapacity: 12,
      maxCapacity: 15,
    },
    subLocationName: 'TestWings',
    subLocations: [],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
  }

  const createLocations = () => {
    locations = [
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 3,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 2,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000001',
        pathHierarchy: 'A-1-001',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 1,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 1,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000002',
        pathHierarchy: 'A-1-002',
        parentId: 'inactiveParent',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 4,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 3,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000003',
        pathHierarchy: 'A-1-003',
        parentId: 'inactiveParent',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 2,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000004',
        pathHierarchy: 'A-1-004',
      }),
    ]
    inactiveParent = LocationFactory.build({
      locationType: 'LANDING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: 'Inactive Parent',
      status: 'INACTIVE',
      active: false,
      id: 'inactiveParent',
      pathHierarchy: 'A-1',
      parentId: 'inactiveParentParent',
    })
    inactiveParentParent = LocationFactory.build({
      locationType: 'WING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: undefined,
      status: 'INACTIVE',
      active: false,
      id: 'inactiveParentParent',
      pathHierarchy: 'A',
    })
  }

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      createLocations()
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsPrisonInactiveCells', locations)
      cy.signIn()
    })

    it('does not show the checkboxes on the inactive cells page', () => {
      InactiveCellsIndexPage.goTo()
      const page = Page.verifyOnPage(InactiveCellsIndexPage)

      page.selectAllCheckbox().should('not.exist')
      page.footer().should('not.exist')
    })
  })

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      createLocations()
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
      cy.task('stubLocationsPrisonInactiveCells', locations)
      locations.forEach(location => cy.task('stubLocations', location))
      cy.task('stubLocations', inactiveParent)
      cy.task('stubLocations', inactiveParentParent)
      cy.task('stubLocations', genericLocation)
      cy.task('stubLocationsBulkReactivate')
      cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
      cy.signIn()
    })

    describe('checkboxes', () => {
      it('does not show the footer initially', () => {
        InactiveCellsIndexPage.goTo()
        const page = Page.verifyOnPage(InactiveCellsIndexPage)

        page.footer().should('exist').should('not.be.visible')
      })

      it('show the footer with the correct text when 1 checkbox is ticked', () => {
        InactiveCellsIndexPage.goTo()
        const page = Page.verifyOnPage(InactiveCellsIndexPage)
        // wait for js to load
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        page.selectCheckbox(locations[2].id).click({ force: true })
        page.footer().should('exist').should('be.visible')
        page.footerCellCount().contains('1 cell selected')
        page.footerClearLink().should('be.visible')
        page.footerSubmit().should('be.visible')

        page.footerClearLink().click()
        page.footer().should('exist').should('not.be.visible')
      })

      it('show the footer with the correct text when all checkboxes are ticked', () => {
        InactiveCellsIndexPage.goTo()
        const page = Page.verifyOnPage(InactiveCellsIndexPage)
        // wait for js to load
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        page.selectAllCheckbox().click({ force: true })
        page.footer().should('exist').should('be.visible')
        page.footerCellCount().contains('4 cells selected')
        page.footerClearLink().should('be.visible')
        page.footerSubmit().should('be.visible')

        page.footerClearLink().click()
        page.footer().should('exist').should('not.be.visible')
      })
    })

    it('redirects to the activate cell screen when only 1 location is selected', () => {
      InactiveCellsIndexPage.goTo()
      const page = Page.verifyOnPage(InactiveCellsIndexPage)
      // wait for js to load
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)
      page.selectCheckbox(locations[2].id).click({ force: true })
      page.footerSubmit().click()

      Page.verifyOnPage(ReactivateCellDetailsPage)
    })

    describe('when a cell has oldWorkingCapacity of 0', () => {
      it('shows an error when the user tries to continue', () => {
        locations[1].oldWorkingCapacity = 0
        cy.task('stubLocations', locations[1])

        InactiveCellsIndexPage.goTo()
        const page = Page.verifyOnPage(InactiveCellsIndexPage)
        // wait for js to load
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        page.selectCheckbox(locations[1].id).click({ force: true })
        page.selectCheckbox(locations[2].id).click({ force: true })
        page.footerSubmit().click()

        const checkCapacityPage = Page.verifyOnPage(ReactivateCellsCheckCapacityPage)
        checkCapacityPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Change the working capacity of A-1-002')
      })
    })

    describe('when multiple locations are selected', () => {
      let checkCapacityPage: ReactivateCellsCheckCapacityPage

      beforeEach(() => {
        InactiveCellsIndexPage.goTo()
        const page = Page.verifyOnPage(InactiveCellsIndexPage)
        // wait for js to load
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        page.selectCheckbox(locations[1].id).click({ force: true })
        page.selectCheckbox(locations[2].id).click({ force: true })
        page.footerSubmit().click()

        checkCapacityPage = Page.verifyOnPage(ReactivateCellsCheckCapacityPage)
      })

      it('shows a list with of the locations with the correct capacities', () => {
        const rows = checkCapacityPage.locationsTableRows()
        const expectedRows = [
          {
            location: 'A-1-002',
            workingCapacity: locations[1].oldWorkingCapacity.toString(),
            maximumCapacity: locations[1].capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-003',
            workingCapacity: locations[2].oldWorkingCapacity.toString(),
            maximumCapacity: locations[2].capacity.maxCapacity.toString(),
            action: 'Change',
          },
        ]

        rows.each((row, i) => {
          const expected = expectedRows[i]
          const cells = checkCapacityPage.locationsTableCells(row as unknown as PageElement)

          cy.wrap(cells.location).contains(expected.location)
          cy.wrap(cells.workingCapacity).contains(expected.workingCapacity)
          cy.wrap(cells.maximumCapacity).contains(expected.maximumCapacity)
          cy.wrap(cells.action).contains(expected.action)
        })
      })

      describe('when no capacities are changed', () => {
        let confirmPage: ReactivateCellsConfirmPage
        beforeEach(() => {
          checkCapacityPage.continueButton().click()
          confirmPage = Page.verifyOnPage(ReactivateCellsConfirmPage)
        })

        it('shows the expected text on the confirm screen', () => {
          cy.get('.change-summary h2').contains('Change to establishment capacity')
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /^The establishment’s total working capacity will increase from 8 to 12.$/,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveParent"]').contains(
            /The status of Inactive Parent will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveParentParent"]').contains(
            /The status of wing A will change to active because it will contain active locations./,
          )
        })

        it('shows the correct banner text after the transaction is submitted', () => {
          confirmPage.confirmButton().click()

          Page.verifyOnPage(InactiveCellsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cells activated')
          cy.get('.govuk-notification-banner__content p').contains('You have activated 2 cells.')
        })
      })

      describe('when on the changeCapacity page', () => {
        let changeCapacityPage: ReactivateCellsChangeCapacityPage
        beforeEach(() => {
          checkCapacityPage.locationsTableRows().eq(0).find('a').click({ force: true })
          changeCapacityPage = Page.verifyOnPage(ReactivateCellsChangeCapacityPage)
        })

        it('shows the correct validation error when missing working capacity', () => {
          changeCapacityPage.maxCapacityInput().clear().type('4')
          changeCapacityPage.workingCapacityInput().clear()
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
          cy.get('#workingCapacity-error').contains('Enter a working capacity')
        })

        it('shows the correct validation error when working capacity > 99', () => {
          changeCapacityPage.maxCapacityInput().clear().type('4')
          changeCapacityPage.workingCapacityInput().clear().type('100')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
        })

        it('shows the correct validation error when working capacity is not a number', () => {
          changeCapacityPage.maxCapacityInput().clear().type('4')
          changeCapacityPage.workingCapacityInput().clear().type('hello')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
          cy.get('#workingCapacity-error').contains('Working capacity must be a number')
        })

        it('shows the correct validation error when working capacity is greater than max capacity', () => {
          changeCapacityPage.maxCapacityInput().clear().type('3')
          changeCapacityPage.workingCapacityInput().clear().type('4')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
        })

        it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
          changeCapacityPage.maxCapacityInput().clear().type('3')
          changeCapacityPage.workingCapacityInput().clear().type('0')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
        })

        it('shows the correct validation error when missing max capacity', () => {
          changeCapacityPage.maxCapacityInput().clear()
          changeCapacityPage.workingCapacityInput().clear().type('2')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Enter a maximum capacity')
          cy.get('#maxCapacity-error').contains('Enter a maximum capacity')
        })

        it('shows the correct validation error when max capacity > 99', () => {
          changeCapacityPage.maxCapacityInput().clear().type('100')
          changeCapacityPage.workingCapacityInput().clear().type('2')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be more than 99')
          cy.get('#maxCapacity-error').contains('Maximum capacity cannot be more than 99')
        })

        it('shows the correct validation error when max capacity is not a number', () => {
          changeCapacityPage.maxCapacityInput().clear().type('hello')
          changeCapacityPage.workingCapacityInput().clear().type('2')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity must be a number')
          cy.get('#maxCapacity-error').contains('Maximum capacity must be a number')
        })

        it('shows the correct validation error when max capacity is zero', () => {
          changeCapacityPage.maxCapacityInput().clear().type('0')
          changeCapacityPage.workingCapacityInput().clear().type('0')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
          cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
        })
      })

      describe('when capacities are changed', () => {
        beforeEach(() => {
          checkCapacityPage.locationsTableRows().eq(0).find('a').click({ force: true })
          let changeCapacityPage = Page.verifyOnPage(ReactivateCellsChangeCapacityPage)
          changeCapacityPage.maxCapacityInput().clear().type('9')
          changeCapacityPage.workingCapacityInput().clear().type('8')
          changeCapacityPage.continueButton().click()

          checkCapacityPage.locationsTableRows().eq(1).find('a').click({ force: true })
          changeCapacityPage = Page.verifyOnPage(ReactivateCellsChangeCapacityPage)
          changeCapacityPage.maxCapacityInput().clear().type('7')
          changeCapacityPage.workingCapacityInput().clear().type('4')
          changeCapacityPage.continueButton().click()

          checkCapacityPage = Page.verifyOnPage(ReactivateCellsCheckCapacityPage)
        })

        it('displays the new values in the locations list', () => {
          const rows = checkCapacityPage.locationsTableRows()
          const expectedRows = [
            {
              location: 'A-1-002',
              workingCapacity: '8',
              maximumCapacity: '9',
              action: 'Change',
            },
            {
              location: 'A-1-003',
              workingCapacity: '4',
              maximumCapacity: '7',
              action: 'Change',
            },
          ]

          rows.each((row, i) => {
            const expected = expectedRows[i]
            const cells = checkCapacityPage.locationsTableCells(row as unknown as PageElement)

            cy.wrap(cells.location).contains(expected.location)
            cy.wrap(cells.workingCapacity).contains(expected.workingCapacity)
            cy.wrap(cells.maximumCapacity).contains(expected.maximumCapacity)
            cy.wrap(cells.action).contains(expected.action)
          })
        })

        it('shows the expected text on the confirm page', () => {
          checkCapacityPage.continueButton().click()
          Page.verifyOnPage(ReactivateCellsConfirmPage)

          cy.get('.change-summary h2').contains('Change to establishment capacity')
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /^The establishment’s total working capacity will increase from 8 to 20./,
          )
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /The establishment’s total maximum capacity will increase from 15 to 26.$/,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveParent"]').contains(
            /The status of Inactive Parent will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveParentParent"]').contains(
            /The status of wing A will change to active because it will contain active locations./,
          )
        })

        it('shows the correct banner text after the transaction is submitted', () => {
          checkCapacityPage.continueButton().click()
          const confirmPage = Page.verifyOnPage(ReactivateCellsConfirmPage)

          confirmPage.confirmButton().click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cells activated')
          cy.get('.govuk-notification-banner__content p').contains('You have activated 2 cells.')
        })
      })
    })
  })
})
