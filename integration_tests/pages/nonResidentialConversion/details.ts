import Page, { PageElement } from '../page'

export default class NonResidentialConversionDetailsPage extends Page {
  constructor() {
    super('Convert cell to non-residential room')
  }

  cellTypeRadioLabels = (): PageElement => cy.get('body').find('label.govuk-radios__label')

  cellTypeRadioItem = (value: string): PageElement =>
    cy.get(`input[name="convertedCellType"][type="radio"][value="${value}"]`)

  explanationInput = (): PageElement => cy.get(`textarea[name$="explanation"]`)

  otherFreeText = (): PageElement => cy.get('#otherConvertedCellType')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
