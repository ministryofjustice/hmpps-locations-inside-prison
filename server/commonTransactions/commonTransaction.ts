import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../controllers/base/formInitialStep'

export default class CommonTransaction {
  protected readonly steps: FormWizard.Steps

  protected readonly fields: FormWizard.Fields

  protected readonly pathPrefix: string

  constructor({
    steps,
    fields = {},
    pathPrefix,
  }: {
    pathPrefix: string
    steps: FormWizard.Steps
    fields?: FormWizard.Fields
  }) {
    const strippedPrefix = pathPrefix.replace(/^\//, '')

    this.pathPrefix = pathPrefix

    this.steps = Object.fromEntries(
      Object.entries(steps).map(([path, step]) => {
        const modifiedStep = { template: '../../partials/formStep', controller: FormInitialStep, ...step }

        if (modifiedStep.next) {
          modifiedStep.next = `${strippedPrefix}/${modifiedStep.next}`
        }

        if (modifiedStep.fields) {
          modifiedStep.fields = modifiedStep.fields.map(field => `${strippedPrefix}/${field}`)
        }

        return [`${pathPrefix}${path}`, modifiedStep]
      }),
    )

    this.fields = Object.fromEntries(
      Object.entries(fields).map(([id, field]) => {
        const modifiedField = { ...field }

        if (modifiedField.id) {
          modifiedField.id = `${strippedPrefix}/${modifiedField.id}`
        }

        if (modifiedField.name) {
          modifiedField.name = `${strippedPrefix}/${modifiedField.name}`
        }

        if (modifiedField.label?.for) {
          modifiedField.label.for = `${strippedPrefix}/${modifiedField.label.for}`
        }

        return [`${strippedPrefix}/${id}`, modifiedField]
      }),
    )
  }

  getSteps({ next }: { next: FormWizard.Step['next'] }) {
    const keys = Object.keys(this.steps)
    const lastStepKey = keys[keys.length - 1]

    return { ...this.steps, [lastStepKey]: { ...this.steps[lastStepKey], next } }
  }

  getFields() {
    return this.fields
  }
}
