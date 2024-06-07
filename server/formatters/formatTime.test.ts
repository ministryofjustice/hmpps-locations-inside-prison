import formatTime from './formatTime'

describe('formatTime', () => {
  describe('when given a string date', () => {
    it('returns the formatted time', () => {
      expect(formatTime('2024-03-12T12:13:14')).toEqual('12:13')
    })
  })

  describe('when given a Date date', () => {
    it('returns the formatted time', () => {
      expect(formatTime(new Date(2024, 11, 9, 18, 14))).toEqual('18:14')
    })
  })

  describe('when given an invalid date string', () => {
    it('returns the passed in value', () => {
      expect(formatTime('an invalid date')).toEqual('an invalid date')
    })
  })

  describe('when given undefined', () => {
    it('returns ""', () => {
      expect(formatTime(undefined)).toEqual('')
    })
  })

  describe('when given null', () => {
    it('returns ""', () => {
      expect(formatTime(null)).toEqual('')
    })
  })
})
