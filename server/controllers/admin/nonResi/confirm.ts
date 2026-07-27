import { StatusType } from '../../../data/types/locationsApi'
import adminController from '../adminController'

const NonResiStatusChangeConfirm = adminController({
  name: 'non-residential locations',
  attribute: 'nonResiServiceActive',
  analyticsEvent: 'non_resi_status',
  apiCalls: async (req, res) => {
    const { prisonId } = res.locals.prisonConfiguration
    const { locationsService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    await locationsService.updateNonResiStatus(req.session.systemToken, prisonId, status)
  },
})

export default NonResiStatusChangeConfirm
