import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import configureSpecialistCellTypeOptions from '../../middleware/configureSpecialistCellTypeOptions'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import isSpecialCell from '../../utils/isSpecialCell'

export default class ChangeCellType extends FormInitialStep {
  override middlewareSetup(): void {
    super.middlewareSetup()
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(configureSpecialistCellTypeOptions(isSpecialCell))
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { specialistCellTypes } = res.locals.decoratedLocation.raw

    return { specialistCellTypes }
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const affectsCapacity = isSpecialCell(req, res)

    locals.title = `Select ${affectsCapacity ? 'special' : 'normal'} cell type`
    locals.titleCaption = `Cell ${res.locals.decoratedLocation.pathHierarchy}`
    locals.buttonText = 'Save cell type'
    req.form.options.fields.specialistCellTypes.component = affectsCapacity ? 'govukRadios' : 'govukCheckboxes'
    req.form.options.fields.specialistCellTypes.multiple = !affectsCapacity

    const { specialistCellTypes } = locals.fields as FormWizard.Fields
    // Fill in checkboxes for normal cell types
    if (specialistCellTypes && req.form.values) {
      const selectedValues = specialistCellTypes.value || []

      specialistCellTypes.items = specialistCellTypes.items.map((item: FormWizard.Item) => ({
        ...item,
        checked: selectedValues.includes(item.value),
      }))
    }

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services
      const { values } = req.form

      const types = values.specialistCellTypes as string | string[]
      const typesArray = Array.isArray(types) ? types : [types]
      await locationsService.updateSpecialistCellTypes(req.session.systemToken, decoratedLocation.id, typesArray)

      req.services.analyticsService.sendEvent(req, 'change_cell_type', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.decoratedLocation
    const affectsCapacity = isSpecialCell(req, res)

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${affectsCapacity ? 'Special cell' : 'Cell'} type changed`,
      content: `You have changed the ${affectsCapacity ? 'special' : 'normal'} cell type for this location.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
