import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { sanitizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import maxLength from '../../validators/maxLength'
import alphanumeric from '../../validators/alphanumeric'
import { ResidentialHierarchy } from '../../data/types/locationsApi/residentialHierarchy'

export default class Details extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals
    const formLocationCode = req.form.options.fields.locationCode
    const { locationType } = res.locals.decoratedLocation

    formLocationCode.label.text = `${locationType} code`
    formLocationCode.hint = {
      text: `The letter or number used to identify the location, for example ${locationType} A.`,
    }

    const backLink = backUrl(req, {
      fallbackUrl: `/manage-locations/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/manage-locations/${prisonId}`,
      continueLink: `/manage-locations/${prisonId}/create-new-${locationType.toLowerCase()}/structure`,
    }
  }

  async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { locationsService } = req.services
      const { values } = req.form

      const { prisonId } = res.locals

      const sanitizedLocalName = sanitizeString(String(values.localName))

      const validationErrors: FormWizard.Errors = {}
      const validator = maxLength(5)

      if (!values.locationCode) {
        validationErrors.locationCode = this.formError('locationCode', 'locationCodeMissing')
      } else if (!validator.fn(String(values.locationCode), 5)) {
        validationErrors.locationCode = this.formError('locationCode', 'locationCodeLength')
      } else if (!alphanumeric(String(values.locationCode))) {
        validationErrors.locationCode = this.formError('locationCode', 'locationCodeAlphanumeric')
      }

      try {
        if (!validationErrors.locationCode) {
          const residentialHierarchy: ResidentialHierarchy[] = await locationsService.getResidentialHierarchy(
            req.session.systemToken,
            String(prisonId),
          )
          const locationCodeExists = residentialHierarchy.some(
            location => location.locationCode === values.locationCode,
          )
          if (locationCodeExists) {
            validationErrors.locationCode = this.formError('locationCode', 'locationCodeExists')
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
            validationErrors.localName = this.formError('localName', 'localNameExists')
          }
        }
      } catch (error) {
        if (error.data.errorCode === 101) {
          return callback({ ...errors, ...validationErrors })
        }
      }
      return callback({ ...errors, ...validationErrors })
    })
  }
}
