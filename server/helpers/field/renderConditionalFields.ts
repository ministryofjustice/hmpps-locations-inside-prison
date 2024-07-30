export default function renderConditionalFields(res, req, [key, field], index, obj) {
  if (!field.items) {
    return [key, field]
  }

  const fields = Object.fromEntries(obj)

  return [
    key,
    {
      ...field,
      items: field.items.map(item => {
        const conditionalFields = [item.conditional || []].flat()
        const components = conditionalFields.map(conditionalFieldKey => {
          const conditionalField = field.prefix
            ? fields[`${field.prefix}[${conditionalFieldKey}]`]
            : fields[conditionalFieldKey]
          console.log(conditionalFieldKey, conditionalField)

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
