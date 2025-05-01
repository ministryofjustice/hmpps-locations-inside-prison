import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { isEqual, sortBy } from 'lodash'
import FormInitialStep from '../base/formInitialStep'

export default class SetCellType extends FormInitialStep {
  async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(token)

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

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const pageTitleText = location.specialistCellTypes.length ? 'Change specific cell type' : 'Set specific cell type'

    const fields = { ...(locals.fields as FormWizard.Fields) }

    if (!req.form.values?.specialistCellTypes) {
      fields.specialistCellTypes.items = fields.specialistCellTypes.items.map((item: FormWizard.Item) => ({
        ...item,
        checked: location.raw.specialistCellTypes.includes(item.value),
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
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    if (isEqual(sortBy(req.form.values.specialistCellTypes as string[]), sortBy(location.raw.specialistCellTypes))) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { location, user } = res.locals
      const { locationsService } = req.services

      const token = await req.services.authService.getSystemClientToken(user.username)

      const cellTypes = req.form.values.specialistCellTypes as string[]
      await locationsService.updateSpecialistCellTypes(token, res.locals.location.id, cellTypes)

      const eventName = location.specialistCellTypes?.length ? 'change_cell_type' : 'set_cell_type'
      req.services.analyticsService.sendEvent(req, eventName, { prison_id: location.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.location

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell type set',
      content: 'You have set a specific cell type for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
