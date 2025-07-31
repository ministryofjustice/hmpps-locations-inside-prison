import Page from '../../../../pages/page'
import goToCreateLocationDetailsPage from '../../goToCreateLocationDetailsPage'
import CreateCellsDetailsPage from '../../../../pages/commonTransactions/createCells/details'

const goToCreateCellsDetailsPage = () => {
  goToCreateLocationDetailsPage('7e570000-0000-1000-8000-000000000002').submit({
    locationCode: '2',
    localName: 'testL',
    createCellsNow: true,
  })

  return Page.verifyOnPage(CreateCellsDetailsPage)
}
export default goToCreateCellsDetailsPage
