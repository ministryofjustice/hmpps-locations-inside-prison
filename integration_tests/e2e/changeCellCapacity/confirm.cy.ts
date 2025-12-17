import LocationFactory from '../../../server/testutils/factories/location'
import ChangeCellCapacityPage from '../../pages/changeCellCapacity'
import ConfirmCellCapacityPage from '../../pages/confirmCellCapacity'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import LocationsApiStubber from '../../mockApis/locationsApi'
import AuthStubber from '../../mockApis/auth'

context('Change cell capacity - confirm', () => {
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

      cy.get('.change-summary h2').contains("Change to cell's capacity")
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

      cy.get('.change-summary h2').contains("Change to cell's capacity")
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
