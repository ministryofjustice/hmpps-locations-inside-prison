import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class ChangeNonResidentialTypeDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const convertedCellType = await req.services.locationsService.getConvertedCellTypes(token)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellType).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, any> {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    const fields = { ...locals.fields }

    const convertedCellTypes = location.raw?.convertedCellType || []

    fields.convertedCellType.items = fields.convertedCellType.items.map((item: FormWizard.Field) => ({
      ...item,
      checked: convertedCellTypes.includes(item.value), // Use the new variable
    }))
    fields.otherConvertedCellType.value = res.locals.location.raw?.otherConvertedCellType || ''

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services
      const token = await req.services.authService.getSystemClientToken(user.username)
      const { values } = req.form
      const preSelectedConvertedCellType = res.locals.location.raw?.convertedCellType || []
      const preOtherTypeChanged = res.locals.location.raw?.otherConvertedCellType || []

      const selectedConvertedCellType = values.convertedCellType
      const selectedOtherConvertedCellType = values.otherConvertedCellType

      const isSameAsPreSelected = preSelectedConvertedCellType.includes(selectedConvertedCellType)
      const isOtherTypeChanged = preOtherTypeChanged.includes(selectedOtherConvertedCellType)

      req.sessionModel.set('convertedCellTypeChanged', !isSameAsPreSelected)
      req.sessionModel.set('otherTypeChanged', !isOtherTypeChanged)

      await locationsService.changeNonResType(
        token,
        res.locals.location.id,
        String(values.convertedCellType),
        values.convertedCellType === 'OTHER' ? String(values.otherConvertedCellType) : undefined,
      )

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId, localName, pathHierarchy } = res.locals.location
    const locationName = localName || pathHierarchy

    const roomTypeChanged = req.sessionModel.get('convertedCellTypeChanged')
    const otherTypeChanged = req.sessionModel.get('otherTypeChanged')

    if (roomTypeChanged) {
      req.flash('success', {
        title: 'Non-residential room type changed',
        content: `You have changed the room type for ${locationName}.`,
      })
    }

    if (otherTypeChanged) {
      req.flash('success', {
        title: 'Non-residential room details updated',
        content: `You have changed the room description for ${locationName}.`,
      })
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
