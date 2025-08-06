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

  return modifiedField
}
