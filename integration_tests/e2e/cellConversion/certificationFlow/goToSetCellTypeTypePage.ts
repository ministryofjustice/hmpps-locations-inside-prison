import Page from '../../../pages/page'
import SetCellTypeTypePage from '../../../pages/setCellType/type'
import goToCapacityPage from './goToCapacityPage'

export default function goToSetCellTypeTypePage() {
  const capacityPage = goToCapacityPage()
  capacityPage.cellTypeActionButton('set').click()

  return Page.verifyOnPage(SetCellTypeTypePage)
}
