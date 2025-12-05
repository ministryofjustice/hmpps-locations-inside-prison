import Page, { PageElement } from '../page'

export default class EditCellsConfirmPage extends Page {
  constructor() {
    super('Edit cells')
  }

  detailsTitle = (): PageElement => cy.get('.govuk-summary-card__title')

  cellDetailsKey = (i: number): PageElement => cy.get('[data-qa=cell-details-summary] .govuk-summary-list__key').eq(i)

  cellDetailsValue = (i: number): PageElement =>
    cy.get('[data-qa=cell-details-summary] .govuk-summary-list__value').eq(i)

  cellInformationTable = () => cy.get('[data-qa=cell-information-table]')

  cellInformationTableCell = (row: number, cell: number) =>
    this.cellInformationTable().get(`.govuk-table__body .govuk-table__row:nth(${row}) .govuk-table__cell:nth(${cell})`)

  createButton = (): PageElement => cy.get('button:contains("Update cells")')

  editCapacitiesLink = (): PageElement => cy.get('a[href$="/capacities/edit"]').first()

  editCellDetailsLink = (): PageElement => cy.get('a[href$="/create-cells/details/edit"]').first()

  editCellNumbersLink = (): PageElement => cy.get('a[href$="/cell-numbers/edit"]')

  editDoorNumbersLink = (): PageElement => cy.get('a[href$="/door-numbers/edit"]')

  editSanitationLink = (): PageElement => cy.get('a[href$="/bulk-sanitation/edit"]')

  editUsedForLink = (): PageElement => cy.get('a[href$="/used-for/edit"]')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
