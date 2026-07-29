import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class ChangeNonResidentialTypeDetails extends FormStep {
  override middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const convertedCellType = await req.services.locationsService.getConvertedCellTypes(req.session.systemToken)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellType).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals

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
      buttonText: 'Save',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { decoratedLocation } = res.locals
      const { convertedCellType: currentConvertedCellType, otherConvertedCellType: currentOtherConvertedCellType } =
        decoratedLocation.raw

      const { convertedCellType, otherConvertedCellType } = req.form.values

      const convertedCellTypeUnchanged = convertedCellType === currentConvertedCellType
      const otherConvertedCellTypeUnchanged = otherConvertedCellType === currentOtherConvertedCellType

      if (
        (convertedCellTypeUnchanged && convertedCellType !== 'OTHER') ||
        (convertedCellType === 'OTHER' && convertedCellTypeUnchanged && otherConvertedCellTypeUnchanged)
      ) {
        return res.redirect(paths.location.view(decoratedLocation))
      }

      return callback({ ...errors })
    })
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
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

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const {
      decoratedLocation,
      decoratedLocation: { localName, pathHierarchy },
    } = res.locals
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

    res.redirect(paths.location.view(decoratedLocation))
  }
}
