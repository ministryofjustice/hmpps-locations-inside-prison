import { StatusType } from '../../../data/types/locationsApi'
import adminController from '../adminController'

const ResiStatusChangeConfirm = adminController({
  name: 'residential locations',
  attribute: 'resiLocationServiceActive',
  analyticsEvent: 'resi_status',
  apiCalls: async (req, res) => {
    const { prisonId } = res.locals.prisonConfiguration
    const { locationsService, prisonService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    await locationsService.updateResiStatus(req.session.systemToken, prisonId, status)

    // block or unblock the screen
    try {
      await prisonService.getScreenStatus(req.session.systemToken, prisonId)
      await prisonService.updateScreen(req.session.systemToken, prisonId, status === 'ACTIVE')
    } catch (error) {
      if (error.responseStatus === 404) {
        await prisonService.addCondition(req.session.systemToken, prisonId, status === 'ACTIVE')
      }
    }
  },
})

export default ResiStatusChangeConfirm
