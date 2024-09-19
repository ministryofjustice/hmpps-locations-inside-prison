import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { isEqual, sortBy } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'

export default class ChangeUsedForDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const usedForTypes = await req.services.locationsService.getUsedForTypes(token)
    req.form.options.fields.usedFor.items = Object.entries(usedForTypes).map(([key, description]) => ({
      value: key,
      text: description,
    }))
    next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, any> {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const fields = { ...locals.fields }

    if (!req.form.values?.usedFor) {
      if (location.usedFor.length === 1) {
        fields.usedFor.items = fields.usedFor.items.map((item: FormWizard.Field) => ({
          ...item,
          checked: location.usedFor.includes(item.value),
        }))
      }
    }

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services
      const token = await req.services.authService.getSystemClientToken(user.username)
      const usedFor = req.form.values.usedFor as string[]
      await locationsService.updateUsedForTypes(token, res.locals.location.id, usedFor)
      next()
    } catch (error) {
      next(error)
    }
  }

  async validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    if (isEqual(sortBy(req.form.values.usedFor), sortBy(location.usedFor))) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }
    return next()
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId, localName, pathHierarchy } = res.locals.location
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
