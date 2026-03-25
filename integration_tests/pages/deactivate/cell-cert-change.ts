import Page, { PageElement } from '../page'

export default class CellCertChangePage extends Page {
  constructor() {
    super('Does the cell’s certified working capacity need to be decreased to 0 on the cell certificate?')
  }

  radio = (value: string): PageElement => cy.get(`input[name="reduceWorkingCapacity"][type="radio"][value="${value}"]`)

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  continueButton = (): PageElement => cy.get('button[type="submit"]:contains("Continue")')

  submit = ({ certChange }: { certChange?: boolean }) => {
    if (certChange !== undefined) {
      this.radio(certChange ? 'YES' : 'NO').check()
    }

    this.continueButton().click()
  }
}
