import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { DecoratedLocation } from '../../decorators/decoratedLocation'

export default class DeactivateTemporaryDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  getInitialValues(_req: FormWizard.Request, res: Response) {
    const { location } = res.locals
    const { deactivatedReason } = location.raw

    let descriptionFieldKey: string
    if (deactivatedReason === 'OTHER') {
      descriptionFieldKey = 'Other'
    } else {
      descriptionFieldKey = `Description-${deactivatedReason}`
    }

    return {
      deactivationReason: deactivatedReason,
      [`deactivationReason${descriptionFieldKey}`]: location.deactivationReasonDescription,
      estimatedReactivationDate: location.proposedReactivationDate,
      planetFmReference: location.planetFmReference,
    }
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { authService, locationsService } = req.services
    const { deactivationReason } = req.form.options.fields
    const token = await authService.getSystemClientToken(user.username)
    const deactivationReasons = await locationsService.getDeactivatedReasons(token)
    deactivationReason.items = Object.entries(deactivationReasons)
      .sort(([a, _], [b, __]) => {
        if ([a, b].includes('OTHER')) {
          return a === 'OTHER' ? 1 : -1
        }

        return a.localeCompare(b)
      })
      .map(([key, value]) => ({
        text: value,
        value: key,
        conditional: `deactivationReason${key === 'OTHER' ? 'Other' : `Description-${key}`}`,
      }))

    Object.keys(deactivationReasons)
      .filter(n => n !== 'OTHER')
      .forEach(key => {
        req.form.options.allFields[`deactivationReasonDescription-${key}`] = {
          ...req.form.options.allFields.deactivationReasonDescription,
          id: `deactivationReasonDescription-${key}`,
          name: `deactivationReasonDescription-${key}`,
        }
      })

    delete req.form.options.allFields.deactivationReasonDescription

    next()
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    req.form.values.deactivationReasonDescription =
      req.body[`deactivationReasonDescription-${req.form.values.deactivationReason}`]
    super.validateFields(req, res, callback)
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)

    const { id: locationId, prisonId } = res.locals.location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/deactivate/temporary/confirm`,
    })
    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, location } = res.locals
      const { locationsService } = req.services

      const { deactivationReason, estimatedReactivationDate, planetFmReference } = req.form.values

      const token = await req.services.authService.getSystemClientToken(user.username)

      const t = await locationsService.updateTemporaryDeactivation(
        token,
        location.id,
        deactivationReason as string,
        req.form.values[`deactivationReason${deactivationReason === 'OTHER' ? 'Other' : 'Description'}`] as string,
        estimatedReactivationDate as string,
        planetFmReference as string,
      )

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { displayName, id: locationId, locationType, prisonId } = location as DecoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Deactivation details updated',
      content: `You have updated the deactivation details for this location.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
