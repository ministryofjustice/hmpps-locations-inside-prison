import Page, { PageElement } from '../../page'

export default class DeactivateTemporaryDetailsPage extends Page {
  constructor() {
    super('Deactivation details')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/deactivate/temporary`)

  reasonRadioLabels = (): PageElement => cy.get('body').find('label.govuk-radios__label')

  reasonRadioItem = (value: string): PageElement =>
    cy.get(`input[name="deactivationReason"][type="radio"][value="${value}"]`)

  descriptionFreeText = (value: string): PageElement => cy.get(`#deactivationReasonDescription-${value}`)

  otherFreeText = (): PageElement => cy.get('#deactivationReasonOther')

  estimatedReactivationDateDayText = (): PageElement => cy.get('#estimatedReactivationDate-day')

  estimatedReactivationDateMonthText = (): PageElement => cy.get('#estimatedReactivationDate-month')

  estimatedReactivationDateYearText = (): PageElement => cy.get('#estimatedReactivationDate-year')

  planetFmReferenceText = (): PageElement => cy.get('#planetFmReference')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
