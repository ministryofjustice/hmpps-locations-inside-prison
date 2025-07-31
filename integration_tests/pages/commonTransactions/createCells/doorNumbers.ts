import Page, { PageElement } from '../../page'

export default class CreateCellsDoorNumbersPage extends Page {
  constructor() {
    super(/Enter cell door numbers/)
  }

  doorNumberInput = (index: number): PageElement => cy.get(`#create-cells_doorNumber${index}`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ doorNumbers }: { doorNumbers?: string[] }) => {
    for (let i = 0; i < doorNumbers.length; i += 1) {
      const input = this.doorNumberInput(i)
      input.clear()

      const text = doorNumbers[i]
      if (text) {
        input.type(text)
      }
    }

    this.continueButton().click()
  }
}
