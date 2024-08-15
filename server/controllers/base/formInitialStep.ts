import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default class FormInitialStep extends FormWizard.Controller {
  getInitialValues(_req: FormWizard.Request, _res: Response): { [key: string]: any } {
    // Override in subclass to return initial values for form
    return {}
  }

  getValues(req: FormWizard.Request, res: Response, callback: (err: any, values?: any) => void) {
    return super.getValues(req, res, (err, values) => {
      if (err) return callback(err)

      const initialValues = this.getInitialValues(req, res)
      const formValues = { ...values }

      Object.keys(initialValues).forEach(fieldName => {
        if (formValues[fieldName] === undefined) {
          formValues[fieldName] = initialValues[fieldName]
        }
      })

      return callback(null, formValues)
    })
  }

  valueOrFieldName(arg: number | { field: string }, fields: Record<string, { label: { text: string } }>) {
    return typeof arg === 'number' ? arg : `the ${fields[arg?.field]?.label?.text?.toLowerCase()}`
  }

  getErrorDetail(error: { args: any; key: string; type: string }, res: Response): { text: string; href: string } {
    const { fields } = res.locals.options
    const field = fields[error.key]
    const fieldName: string = field?.label?.text
    const errorMessageOverrides = field?.errorMessages || {}

    const errorMessages: Record<string, string> = {
      isNoLessThanOccupancy: `${fieldName} cannot be less than the number of people currently occupying the cell`,
      lessThanOrEqualTo: `${fieldName} cannot be more than ${this.valueOrFieldName(error.args.lessThanOrEqualTo, fields)}`,
      nonZeroForNormalCell: `${fieldName} cannot be 0 for a non-specialist cell`,
      numeric: `${fieldName} must be a number`,
      required: `Enter a ${fieldName?.toLowerCase()}`,
      doesNotExceedEstMaxCap: `${fieldName} cannot be more than the establishment's maximum capacity`,
    }

    const errorMessage = errorMessageOverrides[error.type] || errorMessages[error.type] || `${fieldName} is invalid`
    return {
      text: errorMessage,
      href: `#${field?.id}`,
    }
  }

  locals(_req: FormWizard.Request, res: Response): Record<string, any> {
    const { fields } = res.locals.options
    const { values } = res.locals
    Object.keys(fields).forEach(fieldName => {
      const value = values[fieldName]
      fields[fieldName].value = value?.value || value
    })

    const validationErrors: { text: string; href: string }[] = []

    res.locals.errorlist.forEach((error: { args: any; key: string; type: string }) => {
      const errorDetail = this.getErrorDetail(error, res)
      validationErrors.push(errorDetail)
      const field = fields[error.key]
      if (field) {
        fields[error.key].errorMessage = errorDetail
      }
    })

    return {
      fields,
      validationErrors,
    }
  }

  formError(fieldName: string, type: string): FormWizard.Controller.Error {
    return new FormWizard.Controller.Error(fieldName, { args: {}, type, url: '/' })
  }
}
