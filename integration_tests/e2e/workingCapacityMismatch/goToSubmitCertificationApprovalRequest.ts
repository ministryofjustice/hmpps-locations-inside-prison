import Page from '../../pages/page'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = (
  signedOpCapChange?: Parameters<UpdateSignedOpCapDetailsPage['submit']>[0],
) => {
  goToUpdateSignedOpCapIsUpdateNeeded().submit({ updateNeeded: !!signedOpCapChange })
  if (signedOpCapChange) {
    const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    detailsPage.submit(signedOpCapChange)
  }

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
