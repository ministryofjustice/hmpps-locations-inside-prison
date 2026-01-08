import Page, { PageElement } from '../page'

export default class SetCellTypeTypePage extends Page {
  constructor() {
    super('Is it a normal or special cell type?')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/set-cell-type`)

  normalAccommodationType = (): PageElement =>
    cy.get('input[name^=set-cell-type_accommodationType][value=NORMAL_ACCOMMODATION]')

  specialAccommodationType = (): PageElement =>
    cy.get('input[name^=set-cell-type_accommodationType][value=SPECIAL_ACCOMMODATION]')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({ normal, special }: { normal?: true; special?: true }) => {
    if (normal !== undefined) {
      this.normalAccommodationType().click()
    } else if (special !== undefined) {
      this.specialAccommodationType().click()
    }

    this.continueButton().click()
  }
}
