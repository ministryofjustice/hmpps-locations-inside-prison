import { StatusType } from '../../../data/types/locationsApi'
import { ServiceCode } from '../../../data/types/locationsApi/serviceCode'
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

    const serviceCode: ServiceCode = 'DISPLAY_HOUSING_CHECKBOX'
    if (status === 'ACTIVE') {
      await prisonService.activatePrisonService(req.session.systemToken, prisonId, serviceCode)
    } else {
      await prisonService.deactivatePrisonService(req.session.systemToken, prisonId, serviceCode)
    }

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
