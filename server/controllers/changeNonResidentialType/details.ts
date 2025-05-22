import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class ChangeNonResidentialTypeDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const convertedCellType = await req.services.locationsService.getConvertedCellTypes(req.session.systemToken)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellType).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    const fields = { ...(locals.fields as FormWizard.Fields) }
    const convertedCellType =
      (req.form.values.convertedCellType as string) ?? decoratedLocation.raw.convertedCellType ?? ''
    const otherConvertedCellType =
      req.form.values.otherConvertedCellType === ''
        ? null
        : (req.form.values.otherConvertedCellType as string) || decoratedLocation.raw.otherConvertedCellType || ''

    fields.convertedCellType.items = fields.convertedCellType.items.map(item => ({
      ...item,
      checked: item.value === convertedCellType,
    }))

    fields.otherConvertedCellType.value = convertedCellType === 'OTHER' ? otherConvertedCellType : ''

    return {
      ...locals,
      fields,
      backLink: cancelLink,
      cancelLink,
    }
  }

  async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { decoratedLocation } = res.locals
      const { prisonId, id: locationId } = decoratedLocation

      const { convertedCellType } = req.form.values
      const { otherConvertedCellType } = req.form.values
      const currentConvertedCellType = decoratedLocation.raw.convertedCellType
      const currentOtherConvertedCellType = decoratedLocation.raw.otherConvertedCellType

      const convertedCellTypeUnchanged = convertedCellType === currentConvertedCellType
      const otherConvertedCellTypeUnchanged = otherConvertedCellType === currentOtherConvertedCellType

      if (
        (convertedCellTypeUnchanged && convertedCellType !== 'OTHER') ||
        (convertedCellType === 'OTHER' && convertedCellTypeUnchanged && otherConvertedCellTypeUnchanged)
      ) {
        return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
      }
      return callback({ ...errors })
    })
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services
      const { values } = req.form
      const preSelectedConvertedCellType = decoratedLocation.raw.convertedCellType || ''
      const preOtherTypeChanged = decoratedLocation.raw.otherConvertedCellType || ''

      const selectedConvertedCellType = values.convertedCellType
      const selectedOtherConvertedCellType = values.otherConvertedCellType

      const isSameAsPreSelected = preSelectedConvertedCellType === selectedConvertedCellType
      const isOtherTypeChanged = preOtherTypeChanged === selectedOtherConvertedCellType

      req.sessionModel.set('convertedCellTypeChanged', !isSameAsPreSelected)
      req.sessionModel.set('otherTypeChanged', !isOtherTypeChanged)

      await locationsService.changeNonResType(
        req.session.systemToken,
        decoratedLocation.id,
        String(values.convertedCellType),
        values.convertedCellType === 'OTHER' ? String(values.otherConvertedCellType) : undefined,
      )

      req.services.analyticsService.sendEvent(req, 'change_non_res_type', {
        prison_id: decoratedLocation.prisonId,
        converted_cell_type: values.convertedCellType,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId, localName, pathHierarchy } = res.locals.decoratedLocation
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
