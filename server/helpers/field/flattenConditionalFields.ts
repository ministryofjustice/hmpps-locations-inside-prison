import { FieldEntry } from './renderConditionalFields'

export default function flattenConditionalFields([key, field]: FieldEntry) {
  if (!field.items) {
    return [key, field]
  }

  const items = field.items.map(item => {
    if (!item.conditional) {
      return item
    }

    const conditionals = [item.conditional || []].flat()
    const conditionalKeys = conditionals.map(conditional => {
      if (conditional instanceof Object) {
        return conditional.name
      }

      return conditional
    })

    return { ...item, conditional: conditionalKeys }
  })

  return [key, { ...field, items }]
}
