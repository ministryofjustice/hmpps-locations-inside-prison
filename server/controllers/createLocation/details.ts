import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { sanitizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class Details extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary, prisonId, locationId } = res.locals
    const { locationCode: formLocationCode, createCellsNow: formCreateCellsNow } = req.form.options.fields
    const locationType = req.sessionModel.get<string>('locationType')

    locals.title = `Enter ${locationType.toLowerCase()} details`
    locals.titleCaption = `Create new ${locationType.toLowerCase()}`

    locals.backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${[prisonId, locationId].filter(i => i).join('/')}`,
    })
    locals.cancelLink = `/view-and-update-locations/${[prisonId, locationId].filter(i => i).join('/')}`

    if (decoratedResidentialSummary.location) {
      formLocationCode.formGroup = {
        beforeInput: {
          html: `<span class="govuk-label govuk-input-prefix--plain">${decoratedResidentialSummary.location.pathHierarchy}-</span>`,
        },
      }

      formCreateCellsNow.fieldset.legend.text = formCreateCellsNow.fieldset.legend.text.replace(
        'LOCATION_TYPE',
        locationType.toLowerCase(),
      )
    }
    formLocationCode.label.text = `${capFirst(locationType.toLowerCase())} code`
    const locationExample = locationType === 'WING' ? `${capFirst(locationType.toLowerCase())} A` : 'A-1'
    formLocationCode.hint = {
      text: `The letter or number used to identify the location, for example ${locationExample}.`,
    }

    return locals
  }

  async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { locationsService } = req.services
      const { values } = req.form

      const { prisonId, decoratedResidentialSummary } = res.locals

      const sanitizedLocalName = sanitizeString(String(values.localName))

      const validationErrors: FormWizard.Errors = {}

      try {
        if (!validationErrors.locationCode) {
          const locationCodePrefix = decoratedResidentialSummary.location?.pathHierarchy
          const locationCode = (locationCodePrefix ? `${locationCodePrefix}-` : '') + values.locationCode
          const locationCodeExists = decoratedResidentialSummary.subLocations.some(
            location => location.pathHierarchy === locationCode,
          )
          if (locationCodeExists) {
            validationErrors.locationCode = this.formError('locationCode', 'taken')
          }
        }

        if (values.localName) {
          const localNameExists = await locationsService.getLocationByLocalName(
            req.session.systemToken,
            String(prisonId),
            sanitizedLocalName,
            null,
          )
          if (localNameExists) {
            validationErrors.localName = this.formError('localName', 'taken')
          }
        }
      } catch {
        // handled below
      }
      return callback({ ...errors, ...validationErrors })
    })
  }
}
