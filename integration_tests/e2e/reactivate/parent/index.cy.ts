import LocationFactory from '../../../../server/testutils/factories/location'
import Page, { PageElement } from '../../../pages/page'
import InactiveCellsIndexPage from '../../../pages/inactiveCells'
import ReactivateParentChangeCapacityPage from '../../../pages/reactivate/parent/changeCapacity'
import ReactivateParentCheckCapacityPage from '../../../pages/reactivate/parent/checkCapacity'
import ReactivateParentConfirmPage from '../../../pages/reactivate/parent/confirm'
import ReactivateParentSelectPage from '../../../pages/reactivate/parent/select'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'

const createLanding = (id: number) => {
  return LocationFactory.build({
    locationType: 'LANDING',
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    leafLevel: false,
    specialistCellTypes: [],
    localName: undefined,
    status: 'INACTIVE',
    active: false,
    id: `inactiveLanding${id}`,
    pathHierarchy: `A-${id}`,
    parentId: 'inactiveWing',
  })
}

const createCell = (landingId: number, id: number) => {
  return LocationFactory.build({
    locationType: 'CELL',
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    leafLevel: true,
    specialistCellTypes: [],
    localName: undefined,
    status: 'INACTIVE',
    active: false,
    id: `inactiveLanding${landingId}Cell${id}`,
    pathHierarchy: `A-${landingId}-00${id}`,
    parentId: `inactiveLanding${landingId}`,
    oldWorkingCapacity: id,
    capacity: {
      maxCapacity: id + 2,
      workingCapacity: 0,
    },
  })
}

const createRoom = (landingId: number, id: number) => {
  return LocationFactory.build({
    locationType: 'ROOM',
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    leafLevel: true,
    specialistCellTypes: [],
    localName: undefined,
    status: 'INACTIVE',
    active: false,
    id: `inactiveLanding${landingId}Room${id}`,
    pathHierarchy: `A-${landingId}-10${id}`,
    parentId: `inactiveLanding${landingId}`,
    oldWorkingCapacity: id,
    capacity: {
      maxCapacity: id + 2,
      workingCapacity: 0,
    },
    isResidential: false,
  })
}

context('Reactivate parent', () => {
  let locations: ReturnType<typeof LocationFactory.build>[]
  let inactiveWing: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1: ReturnType<typeof LocationFactory.build>
  let inactiveLanding2: ReturnType<typeof LocationFactory.build>
  let inactiveLanding3: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell1: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell2: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell3: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell4: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell5: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell6: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Cell7: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Room1: ReturnType<typeof LocationFactory.build>
  let inactiveLanding1Room2: ReturnType<typeof LocationFactory.build>
  let inactiveLanding2Cell1: ReturnType<typeof LocationFactory.build>
  let inactiveLanding2Cell2: ReturnType<typeof LocationFactory.build>

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
    inactiveWing = LocationFactory.build({
      locationType: 'WING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: undefined,
      status: 'INACTIVE',
      active: false,
      id: 'inactiveWing',
      pathHierarchy: 'A',
      parentId: undefined,
    })
    inactiveLanding1 = createLanding(1)
    inactiveLanding2 = createLanding(2)
    inactiveLanding3 = createLanding(3)
    inactiveLanding1Cell1 = createCell(1, 1)
    inactiveLanding1Cell2 = createCell(1, 2)
    inactiveLanding1Cell3 = createCell(1, 3)
    inactiveLanding1Cell4 = createCell(1, 4)
    inactiveLanding1Cell5 = createCell(1, 5)
    inactiveLanding1Cell6 = createCell(1, 6)
    inactiveLanding1Cell7 = createCell(1, 7)
    inactiveLanding1Room1 = createRoom(1, 1)
    inactiveLanding1Room2 = createRoom(1, 2)
    inactiveLanding2Cell1 = createCell(2, 1)
    inactiveLanding2Cell2 = createCell(2, 2)
    locations = [
      genericLocation,
      inactiveWing,
      inactiveLanding1,
      inactiveLanding2,
      inactiveLanding3,
      inactiveLanding1Cell1,
      inactiveLanding1Cell2,
      inactiveLanding1Cell3,
      inactiveLanding1Cell4,
      inactiveLanding1Cell5,
      inactiveLanding1Cell6,
      inactiveLanding1Cell7,
      inactiveLanding1Room1,
      inactiveLanding1Room2,
      inactiveLanding2Cell1,
      inactiveLanding2Cell2,
    ]
  }

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      createLocations()
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
      cy.task('stubLocations', inactiveWing)
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: inactiveWing,
        subLocations: [inactiveLanding1, inactiveLanding2, inactiveLanding3],
      })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the reactivate buttons in the inactive location banner', () => {
      ViewLocationsShowPage.goTo(inactiveWing.prisonId, inactiveWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateEntireButton().should('not.exist')
      viewLocationsShowPage.inactiveBannerActivateIndividualButton().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    let viewLocationsShowPage: ViewLocationsShowPage

    beforeEach(() => {
      createLocations()
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
      locations.forEach(location => cy.task('stubLocations', location))
      cy.task('stubLocationsBulkReactivate')
      cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
      locations.forEach(location =>
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: location,
          subLocations: locations.filter(l => l.parentId === location.id),
        }),
      )
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
      ViewLocationsShowPage.goTo(inactiveWing.prisonId, inactiveWing.id)
      viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the reactivate buttons in the inactive location banner', () => {
      viewLocationsShowPage.inactiveBannerActivateEntireButton().should('exist')
      viewLocationsShowPage.inactiveBannerActivateIndividualButton().should('exist')
    })

    context('after clicking "Activate entire"', () => {
      let checkCapacityPage: ReactivateParentCheckCapacityPage
      beforeEach(() => {
        viewLocationsShowPage.inactiveBannerActivateEntireButton().click()
        checkCapacityPage = Page.verifyOnPage(ReactivateParentCheckCapacityPage)
      })

      it('shows a list of locations and capacities', () => {
        const rows = checkCapacityPage.locationsTableRows()
        const expectedRows = [
          {
            location: 'A-1-001',
            workingCapacity: inactiveLanding1Cell1.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell1.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-002',
            workingCapacity: inactiveLanding1Cell2.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell2.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-003',
            workingCapacity: inactiveLanding1Cell3.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell3.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-004',
            workingCapacity: inactiveLanding1Cell4.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell4.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-005',
            workingCapacity: inactiveLanding1Cell5.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell5.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-006',
            workingCapacity: inactiveLanding1Cell6.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell6.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-1-007',
            workingCapacity: inactiveLanding1Cell7.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding1Cell7.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-2-001',
            workingCapacity: inactiveLanding2Cell1.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding2Cell1.capacity.maxCapacity.toString(),
            action: 'Change',
          },
          {
            location: 'A-2-002',
            workingCapacity: inactiveLanding2Cell2.oldWorkingCapacity.toString(),
            maximumCapacity: inactiveLanding2Cell2.capacity.maxCapacity.toString(),
            action: 'Change',
          },
        ]

        rows.should('have.length', expectedRows.length)
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
        let confirmPage: ReactivateParentConfirmPage
        beforeEach(() => {
          checkCapacityPage.continueButton().click()
          confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)
        })

        it('shows the expected text on the confirm screen', () => {
          cy.get('.change-summary h2').contains('Change to establishment capacity')
          confirmPage.warningText().contains('Every cell in A-1, A-2 and A-3 will be activated.')
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /^The establishment’s total working capacity will increase from 8 to 39.$/,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveWing"]').contains(
            /The status of wing A will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveLanding1"]').contains(
            /The status of landing A-1 will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveLanding2"]').contains(
            /The status of landing A-2 will change to active because it will contain active locations./,
          )
        })

        it('shows the correct banner text after the transaction is submitted', () => {
          confirmPage.confirmButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Wing activated')
          cy.get('.govuk-notification-banner__content p').contains('You have activated A.')
        })
      })

      describe('when on the changeCapacity page', () => {
        let changeCapacityPage: ReactivateParentChangeCapacityPage
        beforeEach(() => {
          checkCapacityPage.locationsTableRows().eq(0).find('a').click({ force: true })
          changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
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

        it('shows the correct validation error when working capacity is zero for normal accommodation cell', () => {
          changeCapacityPage.maxCapacityInput().clear().type('3')
          changeCapacityPage.workingCapacityInput().clear().type('0')
          changeCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a normal accommodation cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a normal accommodation cell')
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
          let changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
          changeCapacityPage.maxCapacityInput().clear().type('9')
          changeCapacityPage.workingCapacityInput().clear().type('8')
          changeCapacityPage.continueButton().click()

          checkCapacityPage.locationsTableRows().eq(1).find('a').click({ force: true })
          changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
          changeCapacityPage.maxCapacityInput().clear().type('7')
          changeCapacityPage.workingCapacityInput().clear().type('4')
          changeCapacityPage.continueButton().click()

          checkCapacityPage = Page.verifyOnPage(ReactivateParentCheckCapacityPage)
        })

        it('displays the new values in the locations list', () => {
          const rows = checkCapacityPage.locationsTableRows()
          const expectedRows = [
            {
              location: 'A-1-001',
              workingCapacity: '8',
              maximumCapacity: '9',
              action: 'Change',
            },
            {
              location: 'A-1-002',
              workingCapacity: '4',
              maximumCapacity: '7',
              action: 'Change',
            },
            {
              location: 'A-1-003',
              workingCapacity: '3',
              maximumCapacity: '5',
              action: 'Change',
            },
            {
              location: 'A-1-004',
              workingCapacity: '4',
              maximumCapacity: '6',
              action: 'Change',
            },
            {
              location: 'A-1-005',
              workingCapacity: '5',
              maximumCapacity: '7',
              action: 'Change',
            },
            {
              location: 'A-1-006',
              workingCapacity: '6',
              maximumCapacity: '8',
              action: 'Change',
            },
            {
              location: 'A-1-007',
              workingCapacity: '7',
              maximumCapacity: '9',
              action: 'Change',
            },
            {
              location: 'A-2-001',
              workingCapacity: '1',
              maximumCapacity: '3',
              action: 'Change',
            },
            {
              location: 'A-2-002',
              workingCapacity: '2',
              maximumCapacity: '4',
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
          const confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)

          cy.get('.change-summary h2').contains('Change to establishment capacity')
          confirmPage.warningText().contains('Every cell in A-1, A-2 and A-3 will be activated.')
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /^The establishment’s total working capacity will increase from 8 to 48./,
          )
          cy.get('.change-summary p[data-qa="change-summary"]').contains(
            /The establishment’s total maximum capacity will increase from 15 to 24.$/,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveWing"]').contains(
            /The status of wing A will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveLanding1"]').contains(
            /The status of landing A-1 will change to active because it will contain active locations./,
          )
          cy.get('.change-summary p[data-qa="inactive-parent-inactiveLanding2"]').contains(
            /The status of landing A-2 will change to active because it will contain active locations./,
          )
        })

        it('shows the correct banner text after the transaction is submitted', () => {
          checkCapacityPage.continueButton().click()
          const confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)

          confirmPage.confirmButton().click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Wing activated')
          cy.get('.govuk-notification-banner__content p').contains('You have activated A.')
        })
      })
    })

    context('when the child locations are cells/rooms', () => {
      beforeEach(() => {
        ViewLocationsShowPage.goTo(inactiveLanding1.prisonId, inactiveLanding1.id)
        viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      })

      context('after clicking "Activate individual"', () => {
        let selectPage: ReactivateParentSelectPage
        beforeEach(() => {
          viewLocationsShowPage.inactiveBannerActivateIndividualButton().click()
          selectPage = Page.verifyOnPage(ReactivateParentSelectPage)
          cy.get('h1').contains('Activate individual landings')
        })

        it('displays an error if no locations are selected', () => {
          selectPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Select which landings you want to activate')
          cy.get('#selectLocations-error').contains('Select which landings you want to activate')
        })

        it('only displays cells', () => {
          selectPage.locationCheckboxItems().should('have.length', 7)

          selectPage.locationCheckboxItem('inactiveLanding1Cell1').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell2').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell3').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell4').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell5').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell6').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Cell7').should('exist')
          selectPage.locationCheckboxItem('inactiveLanding1Room1').should('not.exist')
          selectPage.locationCheckboxItem('inactiveLanding1Room2').should('not.exist')
        })
      })
    })

    context('when the child locations are not cells/rooms', () => {
      context('after clicking "Activate individual"', () => {
        let selectPage: ReactivateParentSelectPage
        beforeEach(() => {
          viewLocationsShowPage.inactiveBannerActivateIndividualButton().click()
          selectPage = Page.verifyOnPage(ReactivateParentSelectPage)
          cy.get('h1').contains('Activate individual landings')
        })

        it('displays an error if no locations are selected', () => {
          selectPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Select which landings you want to activate')
          cy.get('#selectLocations-error').contains('Select which landings you want to activate')
        })

        context('after selecting a landing', () => {
          let checkCapacityPage: ReactivateParentCheckCapacityPage
          beforeEach(() => {
            selectPage.locationCheckboxItem('inactiveLanding1').click()
            selectPage.continueButton().click()
            checkCapacityPage = Page.verifyOnPage(ReactivateParentCheckCapacityPage)
          })

          it('shows a list of locations and capacities', () => {
            const rows = checkCapacityPage.locationsTableRows()
            const expectedRows = [
              {
                location: 'A-1-001',
                workingCapacity: inactiveLanding1Cell1.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell1.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-002',
                workingCapacity: inactiveLanding1Cell2.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell2.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-003',
                workingCapacity: inactiveLanding1Cell3.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell3.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-004',
                workingCapacity: inactiveLanding1Cell4.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell4.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-005',
                workingCapacity: inactiveLanding1Cell5.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell5.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-006',
                workingCapacity: inactiveLanding1Cell6.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell6.capacity.maxCapacity.toString(),
                action: 'Change',
              },
              {
                location: 'A-1-007',
                workingCapacity: inactiveLanding1Cell7.oldWorkingCapacity.toString(),
                maximumCapacity: inactiveLanding1Cell7.capacity.maxCapacity.toString(),
                action: 'Change',
              },
            ]

            rows.should('have.length', expectedRows.length)
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
            let confirmPage: ReactivateParentConfirmPage
            beforeEach(() => {
              checkCapacityPage.continueButton().click()
              confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)
            })

            it('shows the expected text on the confirm screen', () => {
              cy.get('.change-summary h2').contains('Change to establishment capacity')
              confirmPage.warningText().contains('Every cell in A-1 will be activated.')
              cy.get('.change-summary p[data-qa="change-summary"]').contains(
                /^The establishment’s total working capacity will increase from 8 to 36.$/,
              )
              cy.get('.change-summary p[data-qa="inactive-parent-inactiveWing"]').contains(
                /The status of wing A will change to active because it will contain active locations./,
              )
            })

            it('shows the correct banner text after the transaction is submitted', () => {
              confirmPage.confirmButton().click()

              Page.verifyOnPage(ViewLocationsShowPage)
              cy.get('#govuk-notification-banner-title').contains('Success')
              cy.get('.govuk-notification-banner__content h3').contains('Landing activated')
              cy.get('.govuk-notification-banner__content p').contains('You have activated A-1.')
            })
          })

          describe('when on the changeCapacity page', () => {
            let changeCapacityPage: ReactivateParentChangeCapacityPage
            beforeEach(() => {
              checkCapacityPage.locationsTableRows().eq(0).find('a').click({ force: true })
              changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
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

            it('shows the correct validation error when working capacity is zero for normal accommodation cell', () => {
              changeCapacityPage.maxCapacityInput().clear().type('3')
              changeCapacityPage.workingCapacityInput().clear().type('0')
              changeCapacityPage.continueButton().click()

              cy.get('.govuk-error-summary__title').contains('There is a problem')
              cy.get('.govuk-error-summary__list').contains(
                'Working capacity cannot be 0 for a normal accommodation cell',
              )
              cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a normal accommodation cell')
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
              let changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
              changeCapacityPage.maxCapacityInput().clear().type('9')
              changeCapacityPage.workingCapacityInput().clear().type('8')
              changeCapacityPage.continueButton().click()

              checkCapacityPage.locationsTableRows().eq(1).find('a').click({ force: true })
              changeCapacityPage = Page.verifyOnPage(ReactivateParentChangeCapacityPage)
              changeCapacityPage.maxCapacityInput().clear().type('7')
              changeCapacityPage.workingCapacityInput().clear().type('4')
              changeCapacityPage.continueButton().click()

              checkCapacityPage = Page.verifyOnPage(ReactivateParentCheckCapacityPage)
            })

            it('displays the new values in the locations list', () => {
              const rows = checkCapacityPage.locationsTableRows()
              const expectedRows = [
                {
                  location: 'A-1-001',
                  workingCapacity: '8',
                  maximumCapacity: '9',
                  action: 'Change',
                },
                {
                  location: 'A-1-002',
                  workingCapacity: '4',
                  maximumCapacity: '7',
                  action: 'Change',
                },
                {
                  location: 'A-1-003',
                  workingCapacity: '3',
                  maximumCapacity: '5',
                  action: 'Change',
                },
                {
                  location: 'A-1-004',
                  workingCapacity: '4',
                  maximumCapacity: '6',
                  action: 'Change',
                },
                {
                  location: 'A-1-005',
                  workingCapacity: '5',
                  maximumCapacity: '7',
                  action: 'Change',
                },
                {
                  location: 'A-1-006',
                  workingCapacity: '6',
                  maximumCapacity: '8',
                  action: 'Change',
                },
                {
                  location: 'A-1-007',
                  workingCapacity: '7',
                  maximumCapacity: '9',
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
              const confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)

              cy.get('.change-summary h2').contains('Change to establishment capacity')
              confirmPage.warningText().contains('Every cell in A-1 will be activated.')
              cy.get('.change-summary p[data-qa="change-summary"]').contains(
                /^The establishment’s total working capacity will increase from 8 to 45./,
              )
              cy.get('.change-summary p[data-qa="change-summary"]').contains(
                /The establishment’s total maximum capacity will increase from 15 to 24.$/,
              )
              cy.get('.change-summary p[data-qa="inactive-parent-inactiveWing"]').contains(
                /The status of wing A will change to active because it will contain active locations./,
              )
            })

            it('shows the correct banner text after the transaction is submitted', () => {
              checkCapacityPage.continueButton().click()
              const confirmPage = Page.verifyOnPage(ReactivateParentConfirmPage)

              confirmPage.confirmButton().click()
              Page.verifyOnPage(InactiveCellsIndexPage)

              cy.get('#govuk-notification-banner-title').contains('Success')
              cy.get('.govuk-notification-banner__content h3').contains('Landing activated')
              cy.get('.govuk-notification-banner__content p').contains('You have activated A-1.')
            })
          })
        })
      })
    })
  })
})
