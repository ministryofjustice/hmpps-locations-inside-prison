import numericString from './numericString'

describe('numericString', () => {
  it('allows blank', () => {
    expect(numericString('')).toEqual(true)
  })

  it('allows numbers', () => {
    expect(numericString('14')).toEqual(true)
    expect(numericString('1234567')).toEqual(true)
  })

  it('forbids letters', () => {
    expect(numericString('adg')).toEqual(false)
    expect(numericString('abcdefg')).toEqual(false)
  })

  it('forbids letters and numbers', () => {
    expect(numericString('abcd12efg1234567')).toEqual(false)
    expect(numericString('abcd53ef')).toEqual(false)
    expect(numericString('12gskd4')).toEqual(false)
  })

  it('forbids special characters', () => {
    expect(numericString('abc-')).toEqual(false)
    expect(numericString('4a-a1')).toEqual(false)
    expect(numericString('agfd/aad')).toEqual(false)
    expect(numericString('ag4d=2d')).toEqual(false)
  })
})
