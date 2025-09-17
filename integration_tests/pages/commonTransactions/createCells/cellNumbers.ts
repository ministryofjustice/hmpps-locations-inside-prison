import Page, { PageElement } from '../../page'

export default class CreateCellsCellNumbersPage extends Page {
  constructor() {
    super(/Enter cell numbers/)
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  cellNumberInput = (index: number): PageElement => cy.get(`#create-cells_cellNumber${index}`)

  startCreateCellInput = (): PageElement => cy.get(`#startCreateCellNumber`)

  applyLink = (): PageElement => cy.get(`#apply-cell-numbering`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submitWithNumberingFrom = (startFromNumber?: string) => {
    this.startCreateCellInput().type(startFromNumber)
    this.applyLink().click()

    this.continueButton().click()
  }

  submit = ({ cellNumbers }: { cellNumbers?: string[] }) => {
    for (let i = 0; i < cellNumbers.length; i += 1) {
      const input = this.cellNumberInput(i)
      input.clear()

      const text = cellNumbers[i]
      if (text) {
        input.type(text)
      }
    }
    this.continueButton().click()
  }
}
