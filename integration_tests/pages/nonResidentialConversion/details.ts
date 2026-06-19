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

  submit = ({
    convertedCellType,
    otherConvertedCellType,
    explanation,
  }: {
    convertedCellType?: string
    otherConvertedCellType?: string
    explanation?: string
  } = {}) => {
    if (convertedCellType !== undefined) {
      this.cellTypeRadioItem(convertedCellType).click()
    }

    if (convertedCellType === 'OTHER' || otherConvertedCellType !== undefined) {
      this.otherFreeText().clear()
      if (otherConvertedCellType !== undefined) {
        this.otherFreeText().type(otherConvertedCellType)
      }
    }

    if (explanation !== undefined) {
      this.explanationInput().clear()
      this.explanationInput().type(explanation)
    }

    this.continueButton().click()
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
