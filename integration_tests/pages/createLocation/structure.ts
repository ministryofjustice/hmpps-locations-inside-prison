import Page, { PageElement } from '../page'

export default class CreateLocationStructurePage extends Page {
  constructor() {
    super(/Set \w+ structure/)
  }

  static goTo = (locationId: string) => cy.visit(`/create-new/${locationId}/structure`)

  level2Select = (): PageElement => cy.get('#level-2')

  level3Select = (): PageElement => cy.get('#level-3')

  level4Select = (): PageElement => cy.get('#level-4')

  levelSelect = (level: number): PageElement => cy.get(`#level-${level}`)

  addLevelButton = (): PageElement => cy.get('#addLevel')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  structurePreviewLevel1 = (): PageElement => cy.get('#level1')

  structurePreviewLevel2 = (): PageElement => cy.get('#level2')

  structurePreviewLevel3 = (): PageElement => cy.get('#level3')

  structurePreviewLevel4 = (): PageElement => cy.get('#level4')

  removeLevel3 = (): PageElement => cy.get('#level-3-wrapper .remove-level')

  removeLevel4 = (): PageElement => cy.get('#level-4-wrapper .remove-level')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit({ levels = [] }: { levels?: [string?, string?, string?] } = {}) {
    for (let i = 0; i < levels.length; i += 1) {
      if (i > 1) {
        this.addLevelButton().click()
      }

      this.levelSelect(i + 2).select(levels[i])
    }

    this.continueButton().click()
  }
}
