import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { isEqual, sortBy } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'

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

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const pageTitleText = location.specialistCellTypes.length ? 'Change specific cell type' : 'Set specific cell type'

    const fields = { ...locals.fields }

    if (!req.form.values?.specialistCellTypes) {
      fields.specialistCellTypes.items = fields.specialistCellTypes.items.map((item: FormWizard.Field) => ({
        ...item,
        checked: location.specialistCellTypes.includes(item.value),
      }))
    }

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      fields,
      pageTitleText,
    }
  }

  async validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    if (isEqual(sortBy(req.form.values.specialistCellTypes), sortBy(location.specialistCellTypes))) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services

      const token = await req.services.authService.getSystemClientToken(user.username)

      const cellTypes = req.form.values.specialistCellTypes as string[]
      await locationsService.updateSpecialistCellTypes(token, res.locals.location.id, cellTypes)

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
