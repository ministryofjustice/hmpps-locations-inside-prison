import Page, { PageElement } from '../../page'

export default class EditCapacityPage extends Page {
  constructor() {
    super(/Edit capacity of cells?/)
  }

  cellsTable = (): PageElement => cy.get('[data-qa=edit-capacity-table]')

  cellsTableRows = (): PageElement => this.cellsTable().find('tbody tr')

  cellsTableRow = (index: number): PageElement => this.cellsTableRows().eq(index)

  cnaInput = (index: number): PageElement => this.cellsTableRow(index).find(`input[id^=baselineCna-]`)

  workingInput = (index: number): PageElement => this.cellsTableRow(index).find(`input[id^=workingCapacity-]`)

  maximumInput = (index: number): PageElement => this.cellsTableRow(index).find(`input[id^=maximumCapacity-]`)

  removeCellType = (index: number): PageElement =>
    this.cellsTableRow(index).find(`button[name="cellTypeAction"][value^="remove/"]`)

  setCellType = (index: number): PageElement =>
    this.cellsTableRow(index).find(`button[name="cellTypeAction"][value^="set/"]`)

  cellTypes = (index: number): PageElement => this.cellsTableRow(index).find(`[data-qa^=cell-types-]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ capacities }: { capacities?: [string, string, string][] }) => {
    this.inputValues({ capacities })

    this.continueButton().click()
  }

  testValues = ({ values }: { values?: [string, string, string, string[]][] }) => {
    for (let i = 0; i < values.length; i += 1) {
      const rowValues = values[i]
      const capacityInputs = [this.cnaInput(i), this.workingInput(i), this.maximumInput(i)]
      const testCapacityInputs = [this.cnaInput(i), this.workingInput(i), this.maximumInput(i)]
      const cellTypesEl = this.cellTypes(i)

      for (let capacityIndex = 0; capacityIndex < capacityInputs.length; capacityIndex += 1) {
        const input = capacityInputs[capacityIndex]
        const testInput = testCapacityInputs[capacityIndex]
        const text = rowValues[capacityIndex]

        testInput.invoke('val').then(_value => {
          // Removing this makes the tests fail?
        })
        input.should('have.value', text)
      }

      rowValues[3].forEach(cellType => {
        cellTypesEl.should('contain.text', cellType)
      })
    }
  }

  inputValues = ({ capacities }: { capacities?: [string, string, string][] }) => {
    for (let i = 0; i < capacities.length; i += 1) {
      const capacity = capacities[i]
      const inputs = [this.cnaInput(i), this.workingInput(i), this.maximumInput(i)]

      for (let capacityIndex = 0; capacityIndex < inputs.length; capacityIndex += 1) {
        const input = inputs[capacityIndex]
        input.clear()

        const text = capacity[capacityIndex]
        if (text) {
          input.type(text)
        }
      }
    }

    return this
  }
}
