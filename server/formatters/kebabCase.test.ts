import kebabCase from './kebabCase'

describe('kebabCase', () => {
  it('returns the correct value', () => {
    expect(kebabCase('ATestValue')).toEqual('a-test-value')
    expect(kebabCase('aTestValue')).toEqual('a-test-value')
    expect(kebabCase('aTestvalue')).toEqual('a-testvalue')
    expect(kebabCase('atestvalue')).toEqual('atestvalue')
    expect(kebabCase('a-test-value')).toEqual('a-test-value')
  })
})
