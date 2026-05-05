import Page from '../../../pages/page'
import { Location } from '../../../../server/data/types/locationsApi'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = (
  location: Location,
  signedOpCapChange?: Parameters<UpdateSignedOpCapDetailsPage['submit']>[0],
) => {
  goToUpdateSignedOpCapIsUpdateNeeded(location).submit({ updateNeeded: !!signedOpCapChange })
  if (signedOpCapChange) {
    const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    detailsPage.submit(signedOpCapChange)
  }

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
