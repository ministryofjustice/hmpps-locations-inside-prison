import FormWizard from 'hmpo-form-wizard'
import { FieldEntry } from './renderConditionalFields'

export default function reduceDependentFields(allFields: { [key: string]: FormWizard.Field } = {}) {
  return function reducer(accumulator: { [key: string]: FormWizard.Field }, [key, field]: FieldEntry) {
    if (!field.items) {
      return accumulator
    }

    field.items.forEach(item => {
      const conditionals = [item.conditional || []].flat()
      const dependentOptions = {
        // tell form wizard to not render field at top level
        skip: true,
        // set dependent object for validation
        dependent: {
          field: key,
          value: item.value,
        },
      }

      conditionals.forEach((conditional: FormWizard.Field['items'][0]['conditional']) => {
        const conditionalField = (
          conditional instanceof Object ? conditional : allFields[conditional]
        ) as FormWizard.Field
        if (!conditionalField) {
          return
        }

        const name = (
          field.prefix
            ? `${field.prefix}[${conditionalField.name || conditional}]`
            : conditionalField.name || conditional
        ) as string
        const id = (
          field.prefix ? `${field.id}-${conditionalField.id || conditional}` : conditionalField.id || conditional
        ) as string

        const dataName = name.replace(/\[\d+]/, '[%index%]')
        const dataId = id.replace(/-\d+--/, '-%index%--')

        const attributes = {
          'data-name': dataName,
          'data-id': dataId,
          ...conditionalField.attributes,
        }

        accumulator[name] = {
          ...conditionalField,
          ...dependentOptions,
          name,
          id,
          attributes,
        }
      })
    })

    return accumulator
  }
}
