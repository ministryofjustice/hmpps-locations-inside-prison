import alphanumeric from './alphanumeric'

describe('alphanumeric', () => {
  it('allows letters', () => {
    expect(alphanumeric('adg')).toEqual(true)
    expect(alphanumeric('abcdefg')).toEqual(true)
  })

  it('allows numbers', () => {
    expect(alphanumeric('14')).toEqual(true)
    expect(alphanumeric('1234567')).toEqual(true)
  })

  it('allows letters and numbers', () => {
    expect(alphanumeric('abcd12efg1234567')).toEqual(true)
    expect(alphanumeric('abcd53ef')).toEqual(true)
    expect(alphanumeric('12gskd4')).toEqual(true)
  })

  it('does not allow special characters', () => {
    expect(alphanumeric('abc-')).toEqual(false)
    expect(alphanumeric('4a-a1')).toEqual(false)
    expect(alphanumeric('agfd/aad')).toEqual(false)
    expect(alphanumeric('ag4d=2d')).toEqual(false)
  })
})
