import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { DecoratedLocation } from '../../decorators/decoratedLocation'

export default class ChangeTemporaryDeactivationDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
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

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    req.form.values.deactivationReasonDescription =
      req.body[`deactivationReasonDescription-${req.form.values.deactivationReason}`]
    super.validateFields(req, res, callback)
  }

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
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

  compareInitialAndSubmittedValues(values: { initialValues: FormWizard.Values; submittedValues: FormWizard.Values }) {
    const initialValues = { ...values.initialValues }
    Object.keys(initialValues).forEach(key => {
      if (initialValues[key] === undefined) {
        initialValues[key] = ''
      }
    })
    return JSON.stringify(initialValues) !== JSON.stringify(values.submittedValues)
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const valuesHaveChanged = this.compareInitialAndSubmittedValues({
      initialValues: this.getInitialValues(req, res),
      submittedValues: this.getSubmittedValues(req),
    })

    if (!valuesHaveChanged) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  getDeactivationReasonDesc(deactivationReason: string) {
    return `deactivationReason${deactivationReason === 'OTHER' ? 'Other' : `Description-${deactivationReason}`}`
  }

  getSubmittedValues(req: FormWizard.Request) {
    const { deactivationReason, estimatedReactivationDate, planetFmReference } = req.form.values
    const deactivationReasonDesc = this.getDeactivationReasonDesc(deactivationReason as string)

    return {
      deactivationReason: deactivationReason as string,
      [deactivationReasonDesc]: req.form.values[
        `deactivationReason${deactivationReason === 'OTHER' ? 'Other' : 'Description'}`
      ] as string,

      estimatedReactivationDate: estimatedReactivationDate as string,
      planetFmReference: planetFmReference as string,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, location } = res.locals
      const { locationsService } = req.services

      const submittedValues = this.getSubmittedValues(req)

      const token = await req.services.authService.getSystemClientToken(user.username)

      await locationsService.updateTemporaryDeactivation(
        token,
        location.id,
        submittedValues.deactivationReason,
        submittedValues[this.getDeactivationReasonDesc(submittedValues.deactivationReason as string)],
        submittedValues.estimatedReactivationDate,
        submittedValues.planetFmReference,
      )

      req.services.analyticsService.sendEvent(req, 'change_temp_deactivation', {
        prison_id: location.prisonId,
        location_type: location.locationType,
        deactivation_reason: submittedValues.deactivationReason,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { id: locationId, prisonId } = location as DecoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Deactivation details updated',
      content: `You have updated the deactivation details for this location.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
