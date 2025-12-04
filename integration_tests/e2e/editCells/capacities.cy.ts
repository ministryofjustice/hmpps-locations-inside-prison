import Page from '../../pages/page'
import setupStubs from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import CreateCellsCapacitiesPage from '../../pages/commonTransactions/createCells/capacities'
import CreateCellsTypesPage from '../../pages/commonTransactions/createCells/cellTypes'
import CreateCellsTypesSpecialPage from '../../pages/commonTransactions/createCells/specialCellTypes'
import EditCellsConfirmPage from '../../pages/editCells/confirm'

context('Create Landing - Create cells - Edit - Sanitation', () => {
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('allows editing', () => {
      checkCellInformation(page, [
        ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-002', '2', '2', '3', '4', '-', 'Yes'],
      ])
      page.editCapacitiesLink().click()

      let capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.inputValues({
        capacities: [
          ['1', '1', '1'],
          ['2', '2', '2'],
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
        ['A-2-001', '1', '1', '1', '1', '-', 'No'],
        ['A-2-002', '2', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
      ])
    })
  })
})
