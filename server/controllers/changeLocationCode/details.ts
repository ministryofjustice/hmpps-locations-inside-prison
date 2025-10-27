import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class Details extends FormInitialStep {
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedResidentialSummary, locationHierarchy } = res.locals

    const formLocationCode = req.form.options.fields?.locationCode

    if (decoratedResidentialSummary.location) {
      if (decoratedResidentialSummary.location.level !== 1) {
        const locationPathPrefix = locationHierarchy[locationHierarchy.length - 2].pathHierarchy
        formLocationCode.formGroup = {
          beforeInput: {
            html: `<span class="govuk-label govuk-input-prefix--plain">${locationPathPrefix}-</span>`,
          },
        }
      }
    }

    const locationType = decoratedResidentialSummary.location?.locationType.toLowerCase()
    formLocationCode.label.text = `${capFirst(locationType)} code`

    await super._locals(req, res, next)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals
    const formLocationCode = req.form.options.fields?.locationCode

    const locationType = decoratedResidentialSummary.location?.locationType.toLowerCase()
    const locationExample = locationType === 'wing' ? `${capFirst(locationType.toLowerCase())} A` : 'A-1'

    formLocationCode.value = (req.form.values.locationCode as string) || decoratedResidentialSummary.location?.code
    formLocationCode.hint = {
      text: `The letter or number used to identify the location, for example ${locationExample}.`,
    }

    return {
      ...locals,
      locationType,
      titleCaption: capFirst(decoratedResidentialSummary.location?.displayName),
      title: `Change ${locationType} code`,
      buttonText: `Save ${locationType} code`,
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { values } = req.form
      const { systemToken } = req.session
      const { decoratedResidentialSummary, prisonId, locationId } = res.locals
      const { locationsService } = req.services
      const validationErrors: FormWizard.Errors = {}

      if (values.locationCode === decoratedResidentialSummary.location.code) {
        return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
      }

      // Replace last suffix in the location key with new location code, to see if it exists when calling getLocationByKey
      const createNewKey = (existingLocationCode: string, newLocationCode: string) => {
        const lastDashInString = existingLocationCode.lastIndexOf('-')
        return existingLocationCode.substring(0, lastDashInString + 1) + newLocationCode
      }

      const newKey = createNewKey(decoratedResidentialSummary.location.key, values.locationCode.toString())

      try {
        if (!validationErrors.locationCode) {
          const locationExists = await locationsService.getLocationByKey(systemToken, newKey)
          if (locationExists) {
            validationErrors.locationCode = this.formError('locationCode', 'taken')
          }
        }
        return callback({ ...errors, ...validationErrors })
      } catch {
        // handled below
      }
      return callback({ ...errors, ...validationErrors })
    })
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { systemToken } = req.session
      const { locationId, prisonId } = res.locals
      const { locationsService } = req.services
      const code = req.form.values.locationCode as string

      await locationsService.updateLocationCode(systemToken, locationId, code)

      req.services.analyticsService.sendEvent(req, 'change_location_code', {
        prison_id: prisonId,
        location_id: locationId,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, prisonId, locationType } = res.locals.decoratedResidentialSummary.location
    const newLocationCode = req.form.values.locationCode

    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: `${locationType} code changed`,
      content: `You have changed the ${locationType.toLowerCase()} code for ${newLocationCode}.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
