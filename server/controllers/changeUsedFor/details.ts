import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { isEqual, sortBy } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'

export default class ChangeUsedForDetails extends FormInitialStep {
  override middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const usedForTypes = await req.services.locationsService.getUsedForTypes(req.session.systemToken)
    req.form.options.fields.usedFor.items = Object.values(usedForTypes).map(({ key, description }) => ({
      text: description,
      value: key,
    }))

    next()
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId, leafLevel } = decoratedLocation

    const fields = { ...(locals.fields as FormWizard.Fields) }
    if (!req.form.values?.usedFor) {
      if (leafLevel || decoratedLocation.usedFor.length === 1) {
        fields.usedFor.items = fields.usedFor.items.map((item: FormWizard.Item) => ({
          ...item,
          checked: decoratedLocation.raw.usedFor.includes(item.value),
        }))
      }
    }

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      leafLevel,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services
      const usedFor = req.form.values.usedFor as string[]
      await locationsService.updateUsedForTypes(req.session.systemToken, decoratedLocation.id, usedFor)

      req.services.analyticsService.sendEvent(req, 'change_used_for', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override async validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    if (isEqual(sortBy(req.form.values.usedFor as string[]), sortBy(decoratedLocation.raw.usedFor))) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }
    return next()
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId, localName, pathHierarchy } = res.locals.decoratedLocation
    const locationName = localName || pathHierarchy

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Used for changed',
      content: `You have changed what ${locationName} is used for.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
