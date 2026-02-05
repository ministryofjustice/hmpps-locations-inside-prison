import Page from '../../../../pages/page'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import goToDetails from './goToDetails'

export default function goToSignedOpCapUpdateNeeded() {
  goToDetails().submit({
    reason: 'TEST1',
    reasonDescription: 'Demogorgon sighting on landing A-2',
    day: '12',
    month: '12',
    year: '2045',
    reference: '123456',
    explanation:
      'This wing is currently not safe to operate due to the Demogorgon sighting. We need to deactivate it temporarily while we investigate and resolve the issue.',
  })

  return Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
}
