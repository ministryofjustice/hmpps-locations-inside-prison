// Copied from https://github.com/ministryofjustice/hmpps-strengths-based-needs-assessments-ui/blob/c1d2e0ac64ce2be0ea0a27919cd34f8882b2d5c0/server/%40types/hmpo-form-wizard/index.d.ts

/* eslint-disable max-classes-per-file */
declare module 'hmpo-form-wizard' {
  import express from 'express'

  // These enums have to live here because of TS/Jest and Enums work..  ¯\_(ツ)_/¯
  // Also this ESLint override because of how TS/Eslint works.
  // eslint-disable-next-line no-shadow
  export const enum FieldType {
    Text = 'TEXT',
    Radio = 'RADIO',
    CheckBox = 'CHECKBOX',
    TextArea = 'TEXT_AREA',
    Date = 'DATE',
    Dropdown = 'DROPDOWN',
  }

  // eslint-disable-next-line no-shadow
  export const enum ValidationType {
    String = 'string',
    Regex = 'regex',
    Required = 'required',
    Email = 'email',
    MinLength = 'minlength',
    MaxLength = 'maxlength',
    ExactLength = 'exactlength',
    Alpha = 'alpha',
    AlphaEx = 'alphaex',
    AlphaEx1 = 'alphaex1',
    Alphanumeric = 'alphanum',
    AlphanumericEx = 'alphanumex',
    AlphanumericEx1 = 'alphanumex1',
    Numeric = 'numeric',
    Equal = 'equal',
    PhoneNumber = 'phonenumber',
    UKMobileNumber = 'ukmobilephone',
    Date = 'date',
    DateYear = 'date-year',
    DateMonth = 'date-month',
    DateDay = 'date-day',
    BeforeDate = 'before',
    AfterDate = 'after',
    Postcode = 'postcode',
    Match = 'match',
    BeforeDateField = 'beforeField',
    AfterDateField = 'afterField',
  }

  // eslint-disable-next-line no-shadow
  export const enum FormatterType {
    Trim = 'trim',
    Boolean = 'boolean',
    Uppercase = 'uppercase',
    Lowercase = 'lowercase',
    RemoveSpaces = 'removespaces',
    SingleSpaces = 'singlespaces',
    Hyphens = 'hyphens',
    Apostrophes = 'apostrophes',
    Quotes = 'quotes',
    RemoveRoundBrackets = 'removeroundbrackets',
    RemoveHyphens = 'removehyphens',
    RemoveSlashes = 'removeslashes',
    UKPhonePrefix = 'ukphoneprefix',
    Base64Decode = 'base64decode',
  }

  // eslint-disable-next-line no-shadow
  export const enum Gender {
    NotKnown = 0,
    Male = 1,
    Female = 2,
    NotSpecified = 9,
  }

  function FormWizard(steps: Steps, fields: Fields, config: FormWizardConfig)

  namespace FormWizard {
    type ConditionFn = (isValidated: boolean, values: Record<string, string | Array<string>>) => boolean
    type SectionProgressRule = { fieldCode: string; conditionFn: ConditionFn }

    interface Request extends express.Request {
      form: {
        values: Record<string, string | string[]>
        options: {
          allFields: { [key: string]: Field }
          journeyName: string
          section: string
          sectionProgressRules: Array<SectionProgressRule>
          fields: Fields
          steps: Steps
          locals: Record<string, boolean | string>
        }
        persistedAnswers: Record<string, string | string[]>
      }
      sessionModel: {
        set: (key: string, value: unknown) => void
        get: (key: string) => unknown
      }
    }

    class Controller {
      constructor(options: unknown)

      get(req: Request, res: express.Response, next: express.NextFunction): Promise

      post(req: Request, res: express.Response, next: express.NextFunction): Promise

      configure(req: Request, res: express.Response, next: express.NextFunction): Promise

      process(req: Request, res: express.Response, next: express.NextFunction): Promise

      validate(req: Request, res: express.Response, next: express.NextFunction): Promise

      locals(req: Request, res: express.Response, next: express.NextFunction): Promise

      getValues(req: Request, res: express.Response, next: express.NextFunction): Promise

      saveValues(req: Request, res: express.Response, next: express.NextFunction): Promise

      successHandler(req: Request, res: express.Response, next: express.NextFunction): Promise

      errorHandler(error: Error, req: Request, res: express.Response, next: express.NextFunction): Promise

      setErrors(error: Error, req: Request, res: express.Response)
    }

    namespace Controller {
      export class Error {}
    }

    namespace Field {
      type Option = {
        text: string
        value: string
        checked?: boolean
        conditional?: { html: string }
        hint?: { text: string } | { html: string }
        behaviour?: string
        kind: 'option'
        summary?: {
          displayFn?: (text: string, value: string) => string
        }
      }

      type Divider = {
        divider: string
        kind: 'divider'
      }

      type Options = Array<Option | Divider>
    }

    type AnswerValue = string | number | Array<string | number>

    type FormatterFn = (val: AnswerValue) => AnswerValue

    type Formatter =
      | { type: FormatterType; arguments?: (string | number)[] }
      | { fn: FormatterFn; arguments?: (string | number)[] }

    type ValidatorFn = (val: AnswerValue) => boolean

    type Validate =
      | { type: ValidationType; arguments?: (string | number)[]; message: string }
      | { fn: ValidatorFn; arguments?: (string | number)[]; message: string }

    type Dependent = { field: string; value: string; displayInline?: boolean }

    type Hint = { kind: 'html'; html: string } | { kind: 'text'; text: string }

    interface Field {
      default?: string | number | []
      text: string
      code: string
      id?: string
      hint?: Hint
      type: FieldType
      multiple?: boolean
      options?: FormWizard.Field.Options
      formatter?: Formatter[]
      validate?: Validate[]
      dependent?: Dependent
      invalidates?: string[]
      value?: string | string[]
      labelClasses?: string
      formGroupClasses?: string
      characterCountMax?: number
      classes?: string
      summary?: {
        displayFn?: (value: string) => string
        displayAlways?: boolean
      }
    }

    interface Fields {
      [key: string]: Field
    }

    namespace Step {
      type NextStepCondition = (req: Request, res: Response) => boolean
      type Op = (fieldValue, req, res, con) => boolean
      type FieldValueCondition = { field: string; op?: string | Op; value: string | string[]; next: NextStep }
      type CallbackCondition = { fn: NextStepCondition; next: string }

      type NextStep = FieldValueCondition | CallbackCondition | string | NextStep[]
    }

    interface Step {
      pageTitle: string
      reset?: boolean
      entryPoint?: boolean
      template?: string
      next?: FormWizard.Step.NextStep
      fields?: string[]
      controller?: typeof FormWizard.Controller
      navigationOrder?: number
      backLink?: string
      section: string
      sectionProgressRules?: Array<SectionProgressRule>
      noPost?: boolean
      locals?: Record<string, boolean | string>
    }

    interface RenderedStep {
      pageTitle: string
      reset?: boolean
      entryPoint?: boolean
      template?: string
      next?: FormWizard.Step.NextStep
      fields?: Fields
      controller?: typeof FormWizard.Controller
      navigationOrder?: number
      backLink?: string
      section: string
      sectionProgressRules?: Array<SectionProgressRule>
    }

    interface Steps {
      [key: string]: Step
    }

    interface RenderedSteps {
      [key: string]: RenderedStep
    }

    interface Answers {
      [key: string]: string | string[]
    }
  }

  export default FormWizard
}
/* eslint-enable max-classes-per-file */