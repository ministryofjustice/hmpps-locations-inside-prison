const resolveSortValue = (item: Record<string, unknown>, attributes: string[]) => {
  for (const attribute of attributes) {
    const value = item[attribute]
    if (value) return value
  }

  return undefined
}

/**
 * Returns a sorted copy of the supplied array using the first truthy value found
 * on each item from the provided list of attribute names.
 *
 * Each object is checked in attribute order until a truthy value is found. That
 * value is then used for sorting in ascending order.
 *
 * @param array The objects to sort.
 * @param attributes Attribute names to check in priority order.
 * @returns A new array sorted by the first truthy matching attribute on each item.
 */
export default function sortByFirstPresentAttribute(array: Record<string, unknown>[], ...attributes: string[]) {
  return array.toSorted((a, b) => {
    const aValue = resolveSortValue(a, attributes)
    const bValue = resolveSortValue(b, attributes)

    if (aValue > bValue) {
      return 1
    }
    if (bValue > aValue) {
      return -1
    }
    return 0
  })
}
