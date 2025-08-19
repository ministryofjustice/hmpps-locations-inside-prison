import setupStubs from '../setupStubs'
import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CreateCellsTypesPage from '../../../../pages/commonTransactions/createCells/cellTypes'
import CreateCellsTypesNormalPage from '../../../../pages/commonTransactions/createCells/normalCellTypes'
import CreateCellsTypesSpecialPage from '../../../../pages/commonTransactions/createCells/specialCellTypes'
import CreateCellsCapacitiesPage from '../../../../pages/commonTransactions/createCells/capacities'

import goToCreateCellsTypesPage from './goToCreateCellsTypesPage'
import goToCreateCellsTypesNormalPage from './goToCreateCellsTypesNormalPage'
import goToCreateCellsTypesSpecialPage from './goToCreateCellsTypesSpecialPage'

context('Create landing - Create cells - Types', () => {
  let typesPage: CreateCellsTypesPage
  let normalTypesPage: CreateCellsTypesNormalPage
  let specialTypesPage: CreateCellsTypesSpecialPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    context('Select type page', () => {
      it('shows validation error when neither normal or special type is selected', () => {
        typesPage = goToCreateCellsTypesPage()
        typesPage.continueButton().click()

        typesPage.checkForError(
          'create-cells_set-cell-type_accommodationType0',
          'Select if it is a normal or special cell type',
        )
      })

      it('has a back link to the previous step', () => {
        typesPage = goToCreateCellsTypesPage()
        typesPage.backLink().click()

        Page.verifyOnPage(CreateCellsCapacitiesPage)
      })

      it('has a cancel link to the view location show page', () => {
        typesPage = goToCreateCellsTypesPage()
        typesPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })

    context('Normal types page', () => {
      it('shows validation error when no normal type is selected', () => {
        normalTypesPage = goToCreateCellsTypesNormalPage()
        normalTypesPage.saveButton().click()

        normalTypesPage.checkForError('create-cells_set-cell-type_normalCellTypes0', 'Select a cell type')
      })

      it('correctly saves multiple normal types and shows them on the capacity page', () => {
        normalTypesPage = goToCreateCellsTypesNormalPage()

        normalTypesPage.submit({
          cellType: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
        })

        const capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
        capacitiesPage.cellTypes(0).should('contain.text', 'Accessible cell, Constant Supervision Cell')
        capacitiesPage.removeCellType(0).should('exist')
        capacitiesPage.setCellType(0).should('exist')
      })

      it('has a back link to the previous step', () => {
        normalTypesPage = goToCreateCellsTypesNormalPage()
        normalTypesPage.backLink().click()

        Page.verifyOnPage(CreateCellsTypesPage)
      })

      it('has a cancel link to the view location show page', () => {
        normalTypesPage = goToCreateCellsTypesNormalPage()
        normalTypesPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })

    context('Special type page', () => {
      it('shows validation error when no special type is selected', () => {
        specialTypesPage = goToCreateCellsTypesSpecialPage()
        specialTypesPage.saveButton().click()

        specialTypesPage.checkForError('create-cells_set-cell-type_specialistCellTypes0', 'Select a cell type')
      })

      it('correctly saves the special type and shows it on the capacity page', () => {
        specialTypesPage = goToCreateCellsTypesSpecialPage()

        specialTypesPage.submit({
          cellType: 'BIOHAZARD_DIRTY_PROTEST',
        })

        const capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
        capacitiesPage.cellTypes(0).should('contain.text', 'Biohazard / dirty protest cell')
      })

      it('correctly changes from special type to normal type and shows it on the capacity page', () => {
        specialTypesPage = goToCreateCellsTypesSpecialPage()
        specialTypesPage.submit({
          cellType: 'BIOHAZARD_DIRTY_PROTEST',
        })

        const capacitiesPage = Page.verifyOnPage(CreateCellsCapacitiesPage)
        capacitiesPage.cellTypes(0).should('contain.text', 'Biohazard / dirty protest cell')

        capacitiesPage.setCellType(0).click()

        typesPage = Page.verifyOnPage(CreateCellsTypesPage)
        typesPage.normalAccommodationType().click()
        typesPage.continueButton().click()

        normalTypesPage = Page.verifyOnPage(CreateCellsTypesNormalPage)
        normalTypesPage.submit({
          cellType: ['CONSTANT_SUPERVISION'],
        })

        Page.verifyOnPage(CreateCellsCapacitiesPage)
        capacitiesPage.cellTypes(0).should('contain.text', 'Constant Supervision Cell')
      })

      it('has a back link to the previous step', () => {
        specialTypesPage = goToCreateCellsTypesSpecialPage()
        specialTypesPage.backLink().click()

        Page.verifyOnPage(CreateCellsTypesPage)
      })

      it('has a cancel link to the view location show page', () => {
        specialTypesPage = goToCreateCellsTypesSpecialPage()
        specialTypesPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })
  })
})
