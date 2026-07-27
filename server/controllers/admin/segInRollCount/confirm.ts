import { StatusType } from '../../../data/types/locationsApi'
import adminController from '../adminController'

const SegInRollCountStatusChangeConfirm = adminController({
  name: 'include seg in roll count',
  attribute: 'includeSegregationInRollCount',
  analyticsEvent: 'seg_in_roll_count_status',
  apiCalls: async (req, res) => {
    const { prisonId } = res.locals.prisonConfiguration
    const { locationsService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    await locationsService.updateIncludeSegInRollCount(req.session.systemToken, prisonId, status)
  },
})

export default SegInRollCountStatusChangeConfirm
