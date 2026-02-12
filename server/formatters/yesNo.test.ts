import yesNo from './yesNo'

describe('yesNo', () => {
  it('should return "Yes" when value is "true"', () => {
    expect(yesNo('true')).toBe('Yes')
  })

  it('should return "No" when value is "false"', () => {
    expect(yesNo('false')).toBe('No')
  })

  it('should return "-" for any other value', () => {
    expect(yesNo('unknown')).toBe('-')
    expect(yesNo('')).toBe('-')
    expect(yesNo('yes')).toBe('-')
  })

  it('should return "-" for undefined or null', () => {
    expect(yesNo(undefined as any)).toBe('-')
    expect(yesNo(null as any)).toBe('-')
  })
})
