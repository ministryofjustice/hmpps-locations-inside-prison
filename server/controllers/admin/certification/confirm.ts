import { StatusType } from '../../../data/types/locationsApi'
import adminController from '../adminController'

const CertApprovalStatusChangeConfirm = adminController({
  name: 'certification approval',
  attribute: 'certificationApprovalRequired',
  analyticsEvent: 'certification_status',
  apiCalls: async (req, res) => {
    const { prisonId } = res.locals.prisonConfiguration
    const { locationsService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    await locationsService.updateCertificationApproval(req.session.systemToken, prisonId, status)
  },
})

export default CertApprovalStatusChangeConfirm
