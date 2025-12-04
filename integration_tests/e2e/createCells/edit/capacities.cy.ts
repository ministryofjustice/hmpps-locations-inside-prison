import Page from '../../../pages/page'
import setupStubs from '../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import checkCellInformation from '../checkCellInformation'
import CreateCellsCapacitiesPage from '../../../pages/commonTransactions/createCells/capacities'
import CreateCellsTypesPage from '../../../pages/commonTransactions/createCells/cellTypes'
import CreateCellsTypesSpecialPage from '../../../pages/commonTransactions/createCells/specialCellTypes'

context('Create Landing - Create cells - Edit - Sanitation', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsConfirmPage()
    })

    it('allows editing', () => {
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', '3', '1', '2', '3', '-', 'No'],
        ['A-2-103', '4', '1', '2', '3', '-', 'Yes'],
      ])
      page.editCapacitiesLink().click()

      let capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.inputValues({
        capacities: [
          ['1', '1', '1'],
          ['2', '2', '2'],
          ['0', '0', '3'],
          ['4', '4', '4'],
        ],
      })
      capacitiesPage.removeCellType(0).click()

      capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.setCellType(2).click()

      const setCellTypePage = Page.verifyOnPage(CreateCellsTypesPage)
      setCellTypePage.specialAccommodationType().click()
      setCellTypePage.continueButton().click()

      const specialCellTypePage = Page.verifyOnPage(CreateCellsTypesSpecialPage)
      specialCellTypePage.submit({ cellType: 'BIOHAZARD_DIRTY_PROTEST' })

      capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
      capacitiesPage.continueButton().click()

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '1', '1', '-', 'No'],
        ['A-2-101', '2', '2', '2', '2', '-', 'Yes'],
        ['A-2-102', '3', '0', '0', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-103', '4', '4', '4', '4', '-', 'Yes'],
      ])
    })
  })
})
