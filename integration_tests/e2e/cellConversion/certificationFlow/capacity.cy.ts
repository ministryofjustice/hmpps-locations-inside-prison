import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionCertFlowDoorNumberPage from '../../../pages/cellConversion/certificationFlow/doorNumber'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import CellConversionCertFlowSanitationPage from '../../../pages/cellConversion/certificationFlow/sanitation'
import SetCellTypeTypePage from '../../../pages/setCellType/type'
import SetCellTypeSpecialPage from '../../../pages/setCellType/special'
import goToCapacityPage from './goToCapacityPage'

context('Cell conversion - Cert flow - Capacity', () => {
  let page: CellConversionCertFlowCapacityPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCapacityPage()
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CellConversionCertFlowDoorNumberPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows a table with baseline CNA, working capacity and maximum capacity inputs', () => {
      cy.get('[data-qa=edit-capacity-table]').should('exist')
      cy.get('[data-qa=edit-capacity-table] th').eq(0).contains('Location')
      cy.get('[data-qa=edit-capacity-table] th').eq(1).contains('Baseline CNA')
      cy.get('[data-qa=edit-capacity-table] th').eq(2).contains('Working capacity')
      cy.get('[data-qa=edit-capacity-table] th').eq(3).contains('Maximum capacity')
      cy.get('[data-qa=edit-capacity-table] th').eq(4).contains('Cell type (optional)')
      cy.get('[data-qa=edit-capacity-table] th').eq(5).contains('A-1-001')
    })

    it('shows cell type actions', () => {
      cy.get('[data-qa^=cell-types-]').should('exist')
    })

    describe('validations', () => {
      it('shows a validation error when baseline CNA is missing', () => {
        page.submit({ workingCapacity: '1', maximumCapacity: '2' })

        Page.checkForError('CERT_baselineCna', 'Enter a baseline CNA')
      })

      it('shows a validation error when baseline CNA is not a number', () => {
        page.submit({ baselineCna: 'abc', workingCapacity: '1', maximumCapacity: '2' })

        Page.checkForError('CERT_baselineCna', 'Baseline CNA must be a number')
      })

      it('shows a validation error when baseline CNA is more than 99', () => {
        page.submit({ baselineCna: '100', workingCapacity: '1', maximumCapacity: '2' })

        Page.checkForError('CERT_baselineCna', 'Baseline CNA cannot be more than 99')
      })

      it('shows a validation error when baseline CNA is greater than maximum capacity', () => {
        page.submit({ baselineCna: '4', workingCapacity: '1', maximumCapacity: '3' })

        Page.checkForError('CERT_baselineCna', 'Baseline CNA cannot be more than the maximum capacity')
      })

      it('shows a validation error when baseline CNA is 0 for a normal accommodation cell', () => {
        page.submit({ baselineCna: '0', workingCapacity: '1', maximumCapacity: '2' })

        Page.checkForError('CERT_baselineCna', 'Baseline CNA cannot be 0 for a normal accommodation cell')
      })

      it('shows a validation error when working capacity is missing', () => {
        page.submit({ baselineCna: '1', maximumCapacity: '2' })

        Page.checkForError('CERT_workingCapacity', 'Enter a working capacity')
      })

      it('shows a validation error when working capacity is not a number', () => {
        page.submit({ baselineCna: '1', workingCapacity: 'abc', maximumCapacity: '2' })

        Page.checkForError('CERT_workingCapacity', 'Working capacity must be a number')
      })

      it('shows a validation error when working capacity is more than 99', () => {
        page.submit({ baselineCna: '1', workingCapacity: '100', maximumCapacity: '2' })

        Page.checkForError('CERT_workingCapacity', 'Working capacity cannot be more than 99')
      })

      it('shows a validation error when working capacity is greater than maximum capacity', () => {
        page.submit({ baselineCna: '1', workingCapacity: '4', maximumCapacity: '3' })

        Page.checkForError('CERT_workingCapacity', 'Working capacity cannot be more than the maximum capacity')
      })

      it('shows a validation error when working capacity is 0 for a normal accommodation cell', () => {
        page.submit({ baselineCna: '1', workingCapacity: '0', maximumCapacity: '2' })

        Page.checkForError('CERT_workingCapacity', 'Working capacity cannot be 0 for a normal accommodation cell')
      })

      it('shows a validation error when maximum capacity is missing', () => {
        page.submit({ baselineCna: '1', workingCapacity: '1' })

        Page.checkForError('CERT_maximumCapacity', 'Enter a maximum capacity')
      })

      it('shows a validation error when maximum capacity is not a number', () => {
        page.submit({ baselineCna: '1', workingCapacity: '1', maximumCapacity: 'abc' })

        Page.checkForError('CERT_maximumCapacity', 'Maximum capacity must be a number')
      })

      it('shows a validation error when maximum capacity is 0', () => {
        page.submit({ baselineCna: '0', workingCapacity: '0', maximumCapacity: '0' })

        Page.checkForError('CERT_maximumCapacity', 'Maximum capacity cannot be 0')
      })

      it('shows a validation error when maximum capacity is more than 99', () => {
        page.submit({ baselineCna: '1', workingCapacity: '1', maximumCapacity: '100' })

        Page.checkForError('CERT_maximumCapacity', 'Maximum capacity cannot be more than 99')
      })
    })

    it('continues to the sanitation page', () => {
      page.submit({ baselineCna: '1', workingCapacity: '1', maximumCapacity: '2' })

      Page.verifyOnPage(CellConversionCertFlowSanitationPage)
    })

    it('allows zero baseline CNA and working capacity when a special type is set', () => {
      page.cellTypeActionButton('set').click()
      const typePage = Page.verifyOnPage(SetCellTypeTypePage)
      typePage.submit({ special: true })
      const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
      specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

      page = Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      page.submit({ baselineCna: '0', workingCapacity: '0', maximumCapacity: '1' })

      Page.verifyOnPage(CellConversionCertFlowSanitationPage)
    })
  })
})
