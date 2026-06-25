import Page from '../../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import CreateCellsCapacitiesPage from '../../../pages/commonTransactions/createCells/capacities'
import CreateCellsTypesPage from '../../../pages/commonTransactions/createCells/cellTypes'
import CreateCellsTypesSpecialPage from '../../../pages/commonTransactions/createCells/specialCellTypes'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'

context('Edit cells - Existing landing - Edit - Capacities', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('allows editing only for DRAFT cells', () => {
      checkCellInformation(page, [
        ['A-2-003', '3', '3', '4', '5', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-004', '4', '4', '5', '6', '-', 'Yes'],
        ['A-2-005', '5', '5', '6', '7', '-', 'No'],
      ])
      page.editCapacitiesLink().click()

      let capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.inputValues({
        capacities: [
          ['3', '3', '3'],
          ['4', '4', '4'],
          ['5', '5', '5'],
        ],
      })
      capacitiesPage.removeCellType(0).click()

      capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.setCellType(1).click()

      const setCellTypePage = Page.verifyOnPage(CreateCellsTypesPage)
      setCellTypePage.specialAccommodationType().click()
      setCellTypePage.continueButton().click()

      const specialCellTypePage = Page.verifyOnPage(CreateCellsTypesSpecialPage)
      specialCellTypePage.submit({ cellType: 'BIOHAZARD_DIRTY_PROTEST' })

      capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.continueButton().click()

      page = Page.verifyOnPage(EditCellsConfirmPage)
      checkCellInformation(page, [
        ['A-2-003', '3', '3', '3', '3', '-', 'No'],
        ['A-2-004', '4', '4', '4', '4', 'Biohazard / dirty protest cell', 'Yes'],
        ['A-2-005', '5', '5', '5', '5', '-', 'No'],
      ])
      page.cellInformationTable().should('not.contain', 'A-2-001')
      page.cellInformationTable().should('not.contain', 'A-2-002')
    })
  })
})
