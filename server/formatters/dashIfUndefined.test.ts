import dashIfUndefined from './dashIfUndefined'

describe('dashIfUndefined', () => {
  describe('when given a string', () => {
    it('returns the string', () => {
      expect(dashIfUndefined('abc')).toEqual('abc')
      expect(dashIfUndefined('')).toEqual('')
      expect(dashIfUndefined(null)).toEqual(null)
    })
  })

  describe('when given an undefined', () => {
    it('returns -', () => {
      expect(dashIfUndefined(undefined)).toEqual('-')
    })
  })
})
