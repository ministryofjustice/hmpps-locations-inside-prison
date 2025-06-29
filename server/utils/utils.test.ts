import { convertToTitleCase, initialiseName, sanitizeString, singularizeString } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('sanitizeString', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', ' wing ', 'wing'],
    ['Two words', ' dinner hall ', 'dinner hall'],
    ['HTML characters', 'study <br>room<em></em> ', 'study room'],
    ['Decorated', ' wing Red/White ', 'wing Red/White'],
    ['Extra spaces', '   quiet space    ', 'quiet space'],
  ])('%s -> sanitizeString(%s)', (_, input, expected) => {
    expect(sanitizeString(input)).toEqual(expected)
  })
})

describe('singularizeString', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['Word with s', 'Wings', 'Wing'],
    ['Word without s', 'Landing', 'Landing'],
  ])('%s -> singularizeString(%s)', (_, input, expected) => {
    expect(singularizeString(input)).toEqual(expected)
  })
})
