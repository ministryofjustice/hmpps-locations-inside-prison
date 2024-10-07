import Page, { PageElement } from '../page'

export default class NonResidentialResidentialTypeChangePage extends Page {
  constructor() {
    super('Change non-residential room type')
  }

  cellTypeRadioLabels = (): PageElement => cy.get('body').find('label.govuk-radios__label')

  cellTypeRadioItem = (value: string): PageElement =>
    cy.get(`input[name="convertedCellType"][type="radio"][value="${value}"]`)

  otherFreeText = (): PageElement => cy.get('#otherConvertedCellType')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
