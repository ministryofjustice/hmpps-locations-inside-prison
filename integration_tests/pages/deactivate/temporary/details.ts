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

  reasonDescriptionText = (value: string): PageElement =>
    cy.get(`input[type="text"][id^="deactivationReason"][id$="-${value}"]`)

  mandatoryEstimatedReactivationDateDayText = (): PageElement => cy.get('#mandatoryEstimatedReactivationDate-day')

  mandatoryEstimatedReactivationDateMonthText = (): PageElement => cy.get('#mandatoryEstimatedReactivationDate-month')

  mandatoryEstimatedReactivationDateYearText = (): PageElement => cy.get('#mandatoryEstimatedReactivationDate-year')

  planetFmReferenceText = (): PageElement => cy.get('#planetFmReference')

  facilitiesManagementReferenceText = (): PageElement => cy.get('#facilitiesManagementReference')

  workingCapacityExplanationText = (): PageElement => cy.get('#workingCapacityExplanation')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({
    reason,
    reasonDescription,
    day,
    month,
    year,
    reference,
    explanation,
  }: {
    reason?: string
    reasonDescription?: string
    day?: string
    month?: string
    year?: string
    reference?: string
    explanation?: string
  }) => {
    if (reason !== undefined) {
      this.reasonRadioItem(reason).check()

      this.reasonDescriptionText(reason).clear()
      if (reasonDescription !== undefined) {
        this.reasonDescriptionText(reason).type(reasonDescription)
      }
    }

    this.mandatoryEstimatedReactivationDateDayText().clear()
    this.mandatoryEstimatedReactivationDateMonthText().clear()
    this.mandatoryEstimatedReactivationDateYearText().clear()
    this.facilitiesManagementReferenceText().clear()
    this.workingCapacityExplanationText().clear()

    if (day) {
      this.mandatoryEstimatedReactivationDateDayText().type(day)
    }

    if (month) {
      this.mandatoryEstimatedReactivationDateMonthText().type(month)
    }

    if (year) {
      this.mandatoryEstimatedReactivationDateYearText().type(year)
    }

    if (reference) {
      this.facilitiesManagementReferenceText().type(reference)
    }

    if (explanation) {
      this.workingCapacityExplanationText().type(explanation)
    }

    this.continueButton().click()
  }
}
