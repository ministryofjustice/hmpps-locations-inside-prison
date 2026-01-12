import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import setupStubs from './setupStubs'
import goToCreateLocationWingStructurePage from './goToCreateLocationWingStructurePage'

context('Create  Structure', () => {
  let page: CreateLocationStructurePage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateLocationWingStructurePage()
    })

    it('shows the correct validation error if structure levels contain duplicates', () => {
      page.submit({
        levels: ['Cells', 'Cells'],
      })

      Page.checkForError(null, 'You cannot have two of the same level type')
    })

    it('shows the correct validation error if cells is not the last structure item', () => {
      page.submit({
        levels: ['Landings', 'Spurs'],
      })

      Page.checkForError(null, 'The level 3 type must be cells')
    })

    it('shows the correct default values for select options and preview updates', () => {
      // Check level 2
      page.level2Select().should('have.value', 'Landings')
      page.level3Select().should('have.value', 'Cells')
      page.level4Select().should('not.be.visible')

      // Check preview
      page.structurePreviewLevel2().find('p').should('have.text', 'Landings')
      page.structurePreviewLevel3().find('p').should('have.text', 'Cells')

      // Check updated preview
      page.level3Select().select('Landings')
      page.structurePreviewLevel3().find('p').should('have.text', 'Landings')
    })

    it('shows correct order and updates structure preview when removing a level', () => {
      // Check level 2 preview
      page.structurePreviewLevel2().should('contain.text', 'Landings')
      page.structurePreviewLevel3().should('contain.text', 'Cells')
      page.structurePreviewLevel4().should('contain.text', '')

      // Change level 2 and level 3. Add 4th level
      page.level2Select().select('Spurs')
      page.level3Select().select('Landings')
      page.addLevelButton().click()
      page.level4Select().select('Cells')

      // Check full preview and values
      page.structurePreviewLevel1().should('contain.text', '')
      page.structurePreviewLevel2().should('contain.text', 'Spurs')
      page.structurePreviewLevel3().should('contain.text', 'Landings')
      page.structurePreviewLevel4().should('contain.text', 'Cells')

      page.level2Select().should('have.value', 'Spurs')
      page.level3Select().should('have.value', 'Landings')
      page.level4Select().should('have.value', 'Cells')

      // Remove level 3 and check updated preview
      page.removeLevel3().click()

      page.structurePreviewLevel1().should('contain.text', 'Wing')
      page.structurePreviewLevel2().should('contain.text', 'Spurs')
      page.structurePreviewLevel3().should('contain.text', 'Cells')
      page.structurePreviewLevel4().should('not.contain.text', 'Landings')
      page.structurePreviewLevel4().should('not.contain.text', 'Cells')
    })

    it('has a back link to the enter details page', () => {
      page.backLink().click()
      Page.verifyOnPage(CreateLocationDetailsPage)
    })

    it('has a cancel link to the view location index page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
