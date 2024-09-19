import Page, { PageElement } from '../page'

export default class CellConversionAccommodationTypePage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('legend').contains('What type of accommodation is it?')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/cell-conversion`)

  accommodationTypeRadioLabels = (): PageElement => cy.get('body').find('label.govuk-radios__label')

  accommodationTypeRadioItem = (value: string): PageElement =>
    cy.get(`input[name="accommodationType"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
