import FormWizard from 'hmpo-form-wizard'

export type FieldEntry = [string, FormWizard.Field]

export default function renderConditionalFields(
  req: FormWizard.Request,
  [key, field]: FieldEntry,
  allFieldsEntries: FieldEntry[],
) {
  if (!field.items) {
    return [key, field]
  }

  const fields = Object.fromEntries(allFieldsEntries)

  return [
    key,
    {
      ...field,
      items: field.items.map(item => {
        const conditionalFields = [item.conditional || []].flat()
        const components = conditionalFields.map(conditionalFieldKey => {
          const conditionalField = field.prefix
            ? fields[`${field.prefix}[${conditionalFieldKey}]`]
            : fields[conditionalFieldKey as string]

          if (!conditionalField) {
            return undefined
          }

          return req.services.feComponentsService.getComponent(conditionalField.component, conditionalField)
        })

        if (!components.filter(i => i).length) {
          return item
        }

        return { ...item, conditional: { html: components.join('') } }
      }),
    },
  ]
}
