import Page from '../../../../pages/page'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSignedOpCapUpdateDetails from './goToSignedOpCapUpdateDetails'
import goToSignedOpCapUpdateNeeded from './goToSignedOpCapUpdateNeeded'

export default function goToSubmitCertificationApprovalRequest(withSignedOpCapChange: boolean) {
  if (withSignedOpCapChange) {
    goToSignedOpCapUpdateDetails().submit({
      opCap: 20,
      explanation: 'Op cap changed because of reasons',
    })
  } else {
    goToSignedOpCapUpdateNeeded().submit({ updateNeeded: false })
  }

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}
