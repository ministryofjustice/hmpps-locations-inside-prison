import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../controllers/base/formInitialStep'
import modifyFieldName from '../helpers/field/modifyFieldName'

function convertNext(
  next: FormWizard.Step.NextStep,
  strippedPrefix: string,
  endNext: FormWizard.Step.NextStep,
): FormWizard.Step.NextStep {
  if (typeof next === 'string') {
    if (next === '$END_OF_TRANSACTION$') {
      return endNext
    }

    return `${strippedPrefix}/${next}`
  }

  if (typeof next === 'object') {
    if (Array.isArray(next)) {
      return next.map(n => convertNext(n, strippedPrefix, endNext))
    }

    if ('fn' in next) {
      return {
        ...next,
        next: convertNext(next.next, strippedPrefix, endNext) as string,
      }
    }

    return {
      ...next,
      field: `${strippedPrefix.replace(/:\w+\//g, '')}_${next.field}`,
      next: convertNext(next.next, strippedPrefix, endNext),
    }
  }

  return next
}

export default class CommonTransaction {
  protected readonly steps: FormWizard.Steps

  protected readonly fields: FormWizard.Fields

  protected readonly pathPrefix: string

  constructor({
    pathPrefix,
    steps,
    fields = {},
  }: {
    pathPrefix: string
    steps: FormWizard.Steps
    fields?: FormWizard.Fields
  }) {
    const strippedPrefix = pathPrefix.replace(/^\//, '')

    this.pathPrefix = pathPrefix

    this.steps = Object.fromEntries(
      Object.entries(steps).map(([path, step]) => {
        const modifiedStep: FormWizard.Step = {
          template: '../../partials/formStep',
          controller: FormInitialStep,
          ...step,
        }

        if (modifiedStep.fields) {
          modifiedStep.fields = modifiedStep.fields.map(field => `${strippedPrefix}_${field}`)
        }

        if (modifiedStep.editBackStep) {
          modifiedStep.editBackStep = `${pathPrefix}${modifiedStep.editBackStep}`
        }

        return [`${pathPrefix}${path}`, modifiedStep]
      }),
    )

    this.fields = Object.fromEntries(
      Object.entries(fields).map(([id, field]) => [
        `${strippedPrefix}_${id}`,
        modifyFieldName(field, o => `${strippedPrefix}_${o}`),
      ]),
    )
  }

  getSteps({ next, prefix }: { next: FormWizard.Step['next']; prefix?: string }) {
    const keys = Object.keys(this.steps)
    const lastStepKey = keys[keys.length - 1]
    const extraPrefix = prefix ? `/${prefix}` : ''
    const strippedPrefix = (extraPrefix + this.pathPrefix).replace(/^\//, '')

    return {
      ...Object.fromEntries(
        Object.entries(this.steps).map(([k, step]) => {
          if (!step.next) {
            return [`${extraPrefix}${k}`, step]
          }

          return [`${extraPrefix}${k}`, { ...step, next: convertNext(step.next, strippedPrefix, next) }]
        }),
      ),
      [`${extraPrefix}${lastStepKey}`]: { ...this.steps[lastStepKey], next },
    } as unknown as { [key: string]: Omit<FormWizard.Step, 'controller'> & { controller: typeof FormInitialStep } }
  }

  getFields() {
    return this.fields
  }
}
