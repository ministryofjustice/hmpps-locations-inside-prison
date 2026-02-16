import capFirst from './capFirst'

describe('capFirst', () => {
  it('capitalises the first letter of a string', () => {
    expect(capFirst('abc')).toEqual('Abc')
    expect(capFirst('Abc')).toEqual('Abc')
    expect(capFirst('aBC')).toEqual('ABC')
    expect(capFirst('')).toEqual('')
  })
})
