/**
 * Join a list of items using commas and `and` as
 * the final join
 *
 * @return {String} items joined using commas and the last delimiter
 * @example {{ ["one","two","three"] | nonOxfordJoin }}
 * @param arr
 * @param lastDelimiter
 */
export default function nonOxfordJoin(arr: string[] = [], lastDelimiter = 'and') {
  if (!arr || !Array.isArray(arr)) {
    return arr as unknown as string
  }

  if (arr.length === 1) {
    return arr[0]
  }

  if (arr.length === 2) {
    // joins all with "and" but no commas
    return arr.join(` ${lastDelimiter} `)
  }

  return arr.join(', ').replace(/, ([^,]*)$/, ` ${lastDelimiter} $1`)
}
