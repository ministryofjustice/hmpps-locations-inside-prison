import minLength from './minLength'

const minLengthFn = minLength(1).fn

describe('minLength', () => {
  it('allows a blank value', () => {
    expect(minLengthFn('', 5)).toBe(true)
  })

  it('allows a value that is longer than or equal to the min length', () => {
    expect(minLengthFn('abcde', 5)).toBe(true)
    expect(minLengthFn('abcdef', 5)).toBe(true)
    expect(minLengthFn('abcdefg', 5)).toBe(true)
    expect(minLengthFn('abcdefgh', 5)).toBe(true)
    expect(minLengthFn('abcdefghi', 5)).toBe(true)
  })

  it('does not allow a value that is shorter than the min length', () => {
    expect(minLengthFn('abcd', 5)).toBe(false)
    expect(minLengthFn('a', 5)).toBe(false)
  })
})
