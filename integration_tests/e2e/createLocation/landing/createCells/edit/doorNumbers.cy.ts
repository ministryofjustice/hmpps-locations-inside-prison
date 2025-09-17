import Page from '../../../../../pages/page'
import setupStubs from '../../setupStubs'
import goToCreateCellsConfirmPage from '../goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../../pages/createLocation/confirm'
import checkCellInformation from '../checkCellInformation'
import CreateCellsDoorNumbersPage from '../../../../../pages/commonTransactions/createCells/doorNumbers'

context('Create Landing - Create cells - Edit - Sanitation', () => {
  let page: CreateLocationConfirmPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsConfirmPage()
    })

    it('allows editing', () => {
      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', '3', '1', '2', '3', '-', 'No'],
        ['A-2-103', '4', '1', '2', '3', '-', 'Yes'],
      ])
      page.editDoorNumbersLink().click()

      const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
      doorNumbersPage.submit({ doorNumbers: ['abc4', 'abc3', 'abc2', 'abc1'] })

      page = Page.verifyOnPage(CreateLocationConfirmPage)
      checkCellInformation(page, [
        ['A-2-100', 'abc4', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', 'abc3', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', 'abc2', '1', '2', '3', '-', 'No'],
        ['A-2-103', 'abc1', '1', '2', '3', '-', 'Yes'],
      ])
    })
  })
})
