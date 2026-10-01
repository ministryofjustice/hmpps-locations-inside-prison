import Page, { PageElement } from '../page'

export default class ChangeCellCapacityReasonPage extends Page {
  constructor() {
    super('Explain why you need to change the cell’s capacity')
  }

  reasonInput = (): PageElement => cy.get('#reason')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  submit = ({ reason }: { reason?: string }) => {
    if (reason) {
      this.reasonInput().clear().type(reason)
    }

    this.continueButton().click()
  }
}
