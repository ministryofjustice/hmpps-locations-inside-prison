import FormWizard from 'hmpo-form-wizard'

export default function modifyFieldName(
  field: FormWizard.Field,
  nameModifierFunc: (originalName: string) => string,
): FormWizard.Field {
  const modifiedField = { ...field }

  if (modifiedField.id) {
    modifiedField.id = nameModifierFunc(modifiedField.id)
  }

  if (modifiedField.name) {
    modifiedField.name = nameModifierFunc(modifiedField.name)
  }

  if (modifiedField.label?.for) {
    modifiedField.label.for = nameModifierFunc(modifiedField.label.for)
  }

  if (modifiedField.validate) {
    modifiedField.validate.forEach(validate => {
      if (
        typeof validate === 'object' &&
        'arguments' in validate &&
        typeof validate.arguments[0] === 'object' &&
        validate.arguments[0].field
      ) {
        // eslint-disable-next-line no-param-reassign
        validate.arguments[0] = { ...validate.arguments[0], field: nameModifierFunc(validate.arguments[0].field) }
      }
    })
  }

  return modifiedField
}
