import formatConstants from './formatConstants'
import { LocationsApiConstant } from '../data/types/locationsApi'

describe('formatConstants', () => {
  const constants: LocationsApiConstant[] = [
    { key: 'A', description: 'Alpha' },
    { key: 'B', description: 'Bravo' },
    { key: 'C', description: 'Charlie' },
  ]

  it('returns dash for undefined keys', () => {
    expect(formatConstants(constants, undefined)).toBe('-')
  })

  it('returns dash for empty string', () => {
    expect(formatConstants(constants, '')).toBe('-')
  })

  it('returns dash for empty array', () => {
    expect(formatConstants(constants, [])).toBe('-')
  })

  it('returns description for a single key', () => {
    expect(formatConstants(constants, 'A')).toBe('Alpha')
    expect(formatConstants(constants, 'B')).toBe('Bravo')
    expect(formatConstants(constants, 'C')).toBe('Charlie')
  })

  it('returns dash for a key not in constants', () => {
    expect(formatConstants(constants, 'Z')).toBe('-')
  })

  it('returns joined descriptions for an array of keys', () => {
    expect(formatConstants(constants, ['A', 'B'])).toBe('Alpha<br>Bravo')
    expect(formatConstants(constants, ['B', 'C'])).toBe('Bravo<br>Charlie')
    expect(formatConstants(constants, ['A', 'C', 'B'])).toBe('Alpha<br>Charlie<br>Bravo')
  })

  it('returns dash for array with only empty/undefined keys', () => {
    expect(formatConstants(constants, [''])).toBe('-')
    expect(formatConstants(constants, [undefined as any])).toBe('-')
    expect(formatConstants(constants, ['', undefined as any])).toBe('-')
  })
})
