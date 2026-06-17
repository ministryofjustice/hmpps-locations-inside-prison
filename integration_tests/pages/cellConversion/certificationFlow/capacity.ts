import Page, { PageElement } from '../../page'

export default class CellConversionCertFlowCapacityPage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('h2').contains('Enter cell capacities and type')
  }

  baselineCnaInput = (): PageElement => cy.get('input[name="CERT_baselineCna"]')

  workingCapacityInput = (): PageElement => cy.get('input[name="CERT_workingCapacity"]')

  maximumCapacityInput = (): PageElement => cy.get('input[name="CERT_maximumCapacity"]')

  cellTypeActionButton = (action: 'set' | 'remove'): PageElement =>
    cy.get(`button[name="cellTypeAction"][value="${action}"]`)

  submit = ({
    baselineCna,
    workingCapacity,
    maximumCapacity,
  }: {
    baselineCna?: string
    workingCapacity?: string
    maximumCapacity?: string
  }) => {
    this.baselineCnaInput().clear()
    if (baselineCna !== undefined) {
      this.baselineCnaInput().type(baselineCna)
    }

    this.workingCapacityInput().clear()
    if (workingCapacity !== undefined) {
      this.workingCapacityInput().type(workingCapacity)
    }

    this.maximumCapacityInput().clear()
    if (maximumCapacity !== undefined) {
      this.maximumCapacityInput().type(maximumCapacity)
    }

    this.continueButton().click()
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
