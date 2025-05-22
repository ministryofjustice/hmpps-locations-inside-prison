import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { isEqual, sortBy } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class SetCellType extends FormInitialStep {
  async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

    req.form.options.fields.specialistCellTypes.items = Object.values(specialistCellTypes).map(
      ({ key, description, additionalInformation }) => ({
        text: description,
        value: key,
        hint: {
          text: additionalInformation,
        },
      }),
    )

    next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    const pageTitleText = decoratedLocation.specialistCellTypes.length
      ? 'Change specific cell type'
      : 'Set specific cell type'

    const fields = { ...(locals.fields as FormWizard.Fields) }

    if (!req.form.values?.specialistCellTypes) {
      fields.specialistCellTypes.items = fields.specialistCellTypes.items.map((item: FormWizard.Item) => ({
        ...item,
        checked: decoratedLocation.raw.specialistCellTypes.includes(item.value),
      }))
    }

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
      fields,
      pageTitleText,
    }
  }

  async validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    if (
      isEqual(
        sortBy(req.form.values.specialistCellTypes as string[]),
        sortBy(decoratedLocation.raw.specialistCellTypes),
      )
    ) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      const cellTypes = req.form.values.specialistCellTypes as string[]
      await locationsService.updateSpecialistCellTypes(req.session.systemToken, decoratedLocation.id, cellTypes)

      const eventName = decoratedLocation.specialistCellTypes?.length ? 'change_cell_type' : 'set_cell_type'
      req.services.analyticsService.sendEvent(req, eventName, { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell type set',
      content: 'You have set a specific cell type for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
