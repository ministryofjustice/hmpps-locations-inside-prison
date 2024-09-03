import maxLength from './maxLength'

const maxLengthFn = maxLength(1).fn

describe('maxLength', () => {
  it('allows a blank value', () => {
    expect(maxLengthFn('', 5)).toBe(true)
  })

  it('allows a value that is shorter than or equal to the max length', () => {
    expect(maxLengthFn('a', 5)).toBe(true)
    expect(maxLengthFn('ab', 5)).toBe(true)
    expect(maxLengthFn('abc', 5)).toBe(true)
    expect(maxLengthFn('abcd', 5)).toBe(true)
    expect(maxLengthFn('abcde', 5)).toBe(true)
  })

  it('does not allow a value that is longer than the max length', () => {
    expect(maxLengthFn('abcdef', 5)).toBe(false)
    expect(maxLengthFn('abcdefghijklmnopqrstuvwxyz', 5)).toBe(false)
  })
})
