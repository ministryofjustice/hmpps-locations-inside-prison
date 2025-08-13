import Page, { PageElement } from '../../page'

export default class CreateCellsCapacitiesPage extends Page {
  constructor() {
    super(/Enter cell capacities and type/)
  }

  cnaInput = (index: number): PageElement => cy.get(`#create-cells_baselineCna${index}`)

  workingInput = (index: number): PageElement => cy.get(`#create-cells_workingCapacity${index}`)

  maximumInput = (index: number): PageElement => cy.get(`#create-cells_maximumCapacity${index}`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ capacities }: { capacities?: [string, string, string][] }) => {
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

    this.continueButton().click()
  }
}
