export default function multiSort(array: Record<string, unknown>[], ...attributes: string[]) {
  const resolveSortValue = (item: Record<string, unknown>) => {
    for (const attribute of attributes) {
      const value = item[attribute]
      if (value) return value
    }

    return undefined
  }

  return array.toSorted((a, b) => {
    const aValue = resolveSortValue(a)
    const bValue = resolveSortValue(b)

    if (aValue > bValue) {
      return 1
    }
    if (bValue > aValue) {
      return -1
    }
    return 0
  })
}
