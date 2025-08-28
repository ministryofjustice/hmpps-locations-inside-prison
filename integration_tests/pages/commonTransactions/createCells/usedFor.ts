import Page, { PageElement } from '../../page'

export default class CreateCellsUsedForPage extends Page {
  constructor() {
    super('What are the cells used for?')
  }

  usedForInput = (type: string): PageElement => cy.get(`input[name="create-cells_usedFor"][value="${type}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ usedFor }: { usedFor: string[] }) => {
    usedFor.forEach(type => {
      this.usedForInput(type).click()
    })

    this.continueButton().click()
  }
}
