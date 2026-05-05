import Page from '../../pages/page'
import goToDetails from './goToDetails'
import WorkingCapacityMismatchConfirm from '../../pages/workingCapacityMismatch/confirm'

export default function goToConfirm() {
  goToDetails().submit({ certified: false })

  return Page.verifyOnPage(WorkingCapacityMismatchConfirm)
}
