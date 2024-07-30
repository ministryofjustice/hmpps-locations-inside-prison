import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { flattenConditionalFields, reduceDependentFields, renderConditionalFields } from '../../helpers/field'

export default class FormInitialStep extends FormWizard.Controller {
  middlewareSetup() {
    this.use(this.setupConditionalFields)
    super.middlewareSetup()
  }

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

  getErrorDetail(error: { args: any; key: string; type: string }, res: Response): { text: string; href: string } {
    const { fields } = res.locals.options
    const field = fields[error.key]
    const fieldName: string = field.label.text
    const errorMessageOverrides = field.errorMessages || {}

    const errorMessages: Record<string, string> = {
      doesNotExceedMaxCap: `${fieldName} cannot be more than the maximum capacity`,
      isNoLessThanOccupancy: `${fieldName} cannot be less than the number of people currently occupying the cell`,
      lessThanOrEqualTo: `${fieldName} cannot be more than ${error.args.lessThanOrEqualTo}`,
      nonZeroForNormalCell: `${fieldName} cannot be 0 for a non-specialist cell`,
      numeric: `${fieldName} must be a number`,
      required: `Enter a ${fieldName.toLowerCase()}`,
      doesNotExceedEstMaxCap: `${fieldName} cannot be more than the establishment's maximum capacity`,
    }

    const errorMessage = errorMessageOverrides[error.type] || errorMessages[error.type] || `${fieldName} is invalid`
    return {
      text: errorMessage,
      href: `#${field.id}`,
    }
  }

  setupConditionalFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { allFields, fields } = req.form.options
    const stepFieldsArray = Object.entries(fields)
    const stepFields = stepFieldsArray.map(flattenConditionalFields)
    const dependentFields = stepFieldsArray.reduce(reduceDependentFields(allFields), {})

    req.form.options.fields = {
      ...Object.fromEntries(stepFields),
      ...dependentFields,
    }

    next()
  }

  locals(_req: FormWizard.Request, res: Response): Record<string, any> {
    const { fields } = res.locals.options
    const { values } = res.locals
    Object.keys(fields).forEach(fieldName => {
      fields[fieldName].value = values[fieldName]
    })

    const validationErrors: { text: string; href: string }[] = []

    res.locals.errorlist.forEach((error: { args: any; key: string; type: string }) => {
      const errorDetail = this.getErrorDetail(error, res)
      validationErrors.push(errorDetail)
      fields[error.key].errorMessage = errorDetail
    })

    return {
      fields,
      validationErrors,
    }
  }

  formError(fieldName: string, type: string): FormWizard.Controller.Error {
    return new FormWizard.Controller.Error(fieldName, { args: {}, type, url: '/' })
  }

  render(req, res, next) {
    const fieldsEntries = Object.entries(req.form.options.fields).map(([key, field], index, obj) =>
      renderConditionalFields(res, req, [key, field], index, obj),
    )

    req.form.options.fields = Object.fromEntries(fieldsEntries)
    console.log(Object.keys(req.form.options.fields))
    console.dir(req.form.options.fields, {depth: null})

    super.render(req, res, next)
  }
}
