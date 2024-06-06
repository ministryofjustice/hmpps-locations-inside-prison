import formatDate from './formatDate'

describe('formatDate', () => {
  describe('when given a string date', () => {
    it('returns the formatted date', () => {
      expect(formatDate('2024-03-12T12:13:14')).toEqual('12 March 2024')
    })
  })

  describe('when given a Date date', () => {
    it('returns the formatted date', () => {
      expect(formatDate(new Date(2024, 11, 9))).toEqual('9 December 2024')
    })
  })

  describe('when given an invalid date string', () => {
    it('returns the passed in value', () => {
      expect(formatDate('an invalid date')).toEqual('an invalid date')
    })
  })
})
