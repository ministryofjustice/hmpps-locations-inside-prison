import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { flattenConditionalFields, reduceDependentFields, renderConditionalFields } from '../../helpers/field'
import validateDateInput from '../../helpers/field/validateDateInput'
import { FieldEntry } from '../../helpers/field/renderConditionalFields'
import { TypedLocals } from '../../@types/express'

export default class FormInitialStep extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setupConditionalFields)
    this.use(this.setupRemovedFields)
  }

  getInitialValues(_req: FormWizard.Request, _res: Response): FormWizard.Values {
    // Override in subclass to return initial values for form
    return {}
  }

  getValues(req: FormWizard.Request, res: Response, callback: (err: Error, values?: FormWizard.Values) => void) {
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

  getErrorDetail(
    error: { args: FormWizard.Values; key: string; type: string },
    res: Response,
  ): { text: string; href: string } {
    const { fields } = res.locals.options
    const field = fields[error.key]
    const fieldName: string = field?.nameForErrors || field?.label?.text
    const errorMessageOverrides = field?.errorMessages || {}

    const errorMessages: Record<string, string> = {
      alphanumeric: `${fieldName} must not contain special characters`,
      dateTodayOrInFuture: `${fieldName} must be today or in the future`,
      createLevelDuplicate: 'You cannot have two of the same level type',
      createLevelHierarchy: `The level ${error.args?.createLevelHierarchy} type must be cells`,
      dateInvalid: `${fieldName} must be a real date`,
      dateInvalidDay: `${fieldName} must be a real date`,
      dateInvalidMonth: `${fieldName} must be a real date`,
      dateInvalidYear: `Year must include 4 numbers`,
      dateMissingDay: `${fieldName} must include a day`,
      dateMissingDayAndMonth: `${fieldName} must include a day and month`,
      dateMissingDayAndYear: `${fieldName} must include a day and year`,
      dateMissingMonth: `${fieldName} must include a month`,
      dateMissingMonthAndYear: `${fieldName} must include a month and year`,
      dateMissingYear: `${fieldName} must include a year`,
      doesNotExceedEstMaxCap: `${fieldName} cannot be more than the establishment's maximum capacity`,
      doesNotExceedMaxCap: `${fieldName} cannot be more than the maximum capacity`,
      isNoLessThanOccupancy: `${fieldName} cannot be less than the number of people currently occupying the cell`,
      lessThanOrEqualTo: `${fieldName} cannot be more than ${this.valueOrFieldName(error.args?.lessThanOrEqualTo as number, fields)}`,
      maxLength: `${fieldName} must be ${error.args?.maxLength} characters or less`,
      minLength: `${fieldName} must be at least ${error.args?.minLength} characters`,
      numericString: `${fieldName} must only include numbers`,
      nonZeroForNormalCell: `${fieldName} cannot be 0 for a non-specialist cell`,
      numeric: `${fieldName} must be a number`,
      required: `Enter a ${fieldName?.toLowerCase()}`,
      taken: `A location with this ${fieldName?.toLowerCase()} already exists`,
    }

    const errorMessage =
      errorMessageOverrides[error.type]?.replace(':fieldName', fieldName) ||
      errorMessages[error.type] ||
      `${fieldName} is invalid`
    return {
      text: errorMessage,
      href: `#${field?.id}`,
    }
  }

  renderConditionalFields(req: FormWizard.Request, res: Response) {
    const { options } = req.form

    options.fields = Object.fromEntries(
      Object.entries(options.fields).map(([key, field]: FieldEntry, _, obj: FieldEntry[]) =>
        renderConditionalFields(req, [key, field], obj),
      ),
    )
    res.locals.fields = options.fields
  }

  setupConditionalFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options } = req.form

    const stepFieldsArray = Object.entries(options.fields)
    const stepFields = stepFieldsArray.map(flattenConditionalFields)
    const dependentFields = stepFieldsArray.reduce(reduceDependentFields(options.allFields), {})

    options.fields = {
      ...Object.fromEntries(stepFields),
      ...dependentFields,
    }

    next()
  }

  setupRemovedFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { fields } = req.form.options

    Object.values(fields).forEach(f => {
      // eslint-disable-next-line no-param-reassign
      f.removed = 'remove' in f && f.remove(req, res)
    })

    next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const { options, values } = res.locals
    if (!options?.fields) {
      return {}
    }

    const { allFields } = options
    const fields = this.setupFields(req, allFields, options.fields, values, res.locals.errorlist)

    const validationErrors: { text: string; href: string }[] = []

    res.locals.errorlist.forEach((error: { args: FormWizard.Values; key: string; type: string }) => {
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

  formError(fieldName: string, type: string, args?: unknown): FormWizard.Controller.Error {
    return new FormWizard.Controller.Error(fieldName, { arguments: args, type, url: '/' })
  }

  setupDateInputFields(fields: FormWizard.Fields, errorlist: FormWizard.Controller.Error[]): FormWizard.Fields {
    Object.values(fields)
      .filter(field => field.component === 'govukDateInput')
      .forEach(field => {
        const { value } = field
        const error = errorlist.find(e => e.key === field.id)
        let errorFields = error?.type?.match(/(Day|Month|Year)/g)?.slice()
        if (!errorFields) {
          errorFields = ['*']
        }
        const [year, month, day] = value ? (value as string).split('-') : []

        // eslint-disable-next-line no-param-reassign
        field.items = [
          {
            classes: `govuk-input--width-2 ${error && ['*', 'Day'].filter(s => errorFields.includes(s)).length ? 'govuk-input--error' : ''}`,
            label: 'Day',
            id: `${field.id}-day`,
            name: `${field.id}-day`,
            value: day || '',
          },
          {
            classes: `govuk-input--width-2 ${error && ['*', 'Month'].filter(s => errorFields.includes(s)).length ? 'govuk-input--error' : ''}`,
            label: 'Month',
            id: `${field.id}-month`,
            name: `${field.id}-month`,
            value: month || '',
          },
          {
            classes: `govuk-input--width-4 ${error && ['*', 'Year'].filter(s => errorFields.includes(s)).length ? 'govuk-input--error' : ''}`,
            label: 'Year',
            id: `${field.id}-year`,
            name: `${field.id}-year`,
            value: year || '',
          },
        ]
      })

    return fields
  }

  setupFields(
    req: FormWizard.Request,
    allFields: { [field: string]: FormWizard.Field },
    originalFields: FormWizard.Fields,
    values: FormWizard.Values | { [field: string]: { value: string } },
    errorlist: FormWizard.Controller.Error[],
  ): FormWizard.Fields {
    const fields = originalFields

    Object.keys(fields).forEach(fieldName => {
      const value = values[fieldName]

      if (typeof value === 'object' && value !== null && 'value' in value) {
        fields[fieldName].value = value?.value as string
      } else {
        fields[fieldName].value = value as string
      }
    })

    return this.setupDateInputFields(fields, errorlist)
  }

  render(req: FormWizard.Request, res: Response, next: NextFunction) {
    this.renderConditionalFields(req, res)

    return super.render(req, res, next)
  }

  populateDateInputFieldValues(req: FormWizard.Request) {
    Object.values(req.form.options.fields)
      .filter(field => field.component === 'govukDateInput')
      .map(field => field.id)
      .forEach(id => {
        const day = req.body[`${id}-day`]
        const month = req.body[`${id}-month`]
        const year = req.body[`${id}-year`]
        if (!day && !month && !year) {
          return
        }

        req.form.values[id] = [
          year,
          month !== '' ? month.toString().padStart(2, '0') : '',
          day !== '' ? day.toString().padStart(2, '0') : '',
        ].join('-')
      })
  }

  validateDateInputFields(req: FormWizard.Request, validationErrors: FormWizard.Errors) {
    const { values } = req.form

    Object.values(req.form.options.fields)
      .filter(field => field.component === 'govukDateInput')
      .forEach(field => {
        const { id } = field
        if (values[id]) {
          const day = req.body[`${id}-day`]
          const month = req.body[`${id}-month`]
          const year = req.body[`${id}-year`]
          const error = validateDateInput(day, month, year)
          if (error) {
            // eslint-disable-next-line no-param-reassign
            validationErrors[field.id] = this.formError(field.id, error)
          }
        }
      })
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    this.populateDateInputFieldValues(req)

    Object.entries(req.form.options.fields).forEach(([key, field]) => {
      if (field.removed) {
        delete req.form.options.fields[key]
      }
    })

    super.validateFields(req, res, errors => {
      const validationErrors: FormWizard.Errors = {}

      this.validateDateInputFields(req, validationErrors)

      callback({ ...errors, ...validationErrors })
    })
  }
}
