import Page, { PageElement } from '../page'

export default class ChangeLocationCodePage extends Page {
  locationType: string

  constructor(locationType = 'location') {
    super(`Change ${locationType} ${locationType === 'cell' ? 'number' : 'code'}`)
    this.locationType = locationType
    this.checkOnPage()
  }

  static goTo = (locationId?: string) => cy.visit(`/location/${locationId}/change-location-code/details`)

  locationCodeInputPrefix = (): PageElement => cy.get('.govuk-input-prefix--plain')

  locationCodeInput = (): PageElement => cy.get('#locationCode')

  confirmButton = (): PageElement =>
    cy.get(`button:contains('Save ${this.locationType} ${this.locationType === 'cell' ? 'number' : 'code'}')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({ locationCode }: { locationCode?: string }) => {
    this.locationCodeInput().clear()
    if (locationCode) {
      this.locationCodeInput().type(locationCode)
    }
    this.confirmButton().click()
  }
}
