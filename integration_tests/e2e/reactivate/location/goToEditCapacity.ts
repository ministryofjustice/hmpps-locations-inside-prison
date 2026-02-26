import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import goToCheckCapacity from './goToCheckCapacity'
import EditCapacityPage from '../../../pages/reactivate/location/editCapacity'

export default function goToEditCapacity(location: Location, landing: Location) {
  goToCheckCapacity(location).editCapacityLink(landing.id).click()

  return Page.verifyOnPage(EditCapacityPage)
}
