import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class ChangeTemporaryDeactivationDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { decoratedLocation } = res.locals
    const { deactivatedReason } = decoratedLocation.raw

    let descriptionFieldKey: string
    if (deactivatedReason === 'OTHER') {
      descriptionFieldKey = 'Other'
    } else {
      descriptionFieldKey = `Description-${deactivatedReason}`
    }

    return {
      deactivationReason: deactivatedReason,
      [`deactivationReason${descriptionFieldKey}`]: decoratedLocation.deactivationReasonDescription,
      estimatedReactivationDate: decoratedLocation.proposedReactivationDate,
      planetFmReference: decoratedLocation.planetFmReference,
    }
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services
    const { deactivationReason } = req.form.options.fields
    const deactivationReasons = await locationsService.getDeactivatedReasons(systemToken)

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

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)

    const { id: locationId, prisonId } = res.locals.decoratedLocation

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
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

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
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      const submittedValues = this.getSubmittedValues(req)

      await locationsService.updateTemporaryDeactivation(
        req.session.systemToken,
        decoratedLocation.id,
        submittedValues.deactivationReason,
        submittedValues[this.getDeactivationReasonDesc(submittedValues.deactivationReason as string)],
        submittedValues.estimatedReactivationDate,
        submittedValues.planetFmReference,
      )

      req.services.analyticsService.sendEvent(req, 'change_temp_deactivation', {
        prison_id: decoratedLocation.prisonId,
        location_type: decoratedLocation.locationType,
        deactivation_reason: submittedValues.deactivationReason,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Deactivation details updated',
      content: `You have updated the deactivation details for this location.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
