import Page, { PageElement } from '../../page'

export default class CreateCellsCellNumbersPage extends Page {
  constructor() {
    super(/CELL_NUMBERS/)
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ cellNumbers }: { cellNumbers?: string[] }) => {
    for (let i = 0; i < cellNumbers.length; i += 1) {
      //   const input = this.cellNumberInput(i)
      //   input.clear()
      //
      //   const text = cellNumbers[i]
      //   if (text) {
      //     input.type(text)
      //   }
    }

    this.continueButton().click()
  }
}
