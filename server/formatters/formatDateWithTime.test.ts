import formatDateWithTime from './formatDateWithTime'

describe('formatDateWithTime', () => {
  describe('when given a string date', () => {
    it('returns the formatted date and time', () => {
      expect(formatDateWithTime('2024-03-12T12:13:14')).toEqual('12 March 2024 at 12:13')
    })
  })

  describe('when given a Date date', () => {
    it('returns the formatted date and time', () => {
      expect(formatDateWithTime(new Date(2024, 11, 9, 18, 14))).toEqual('9 December 2024 at 18:14')
    })
  })

  describe('showMidnightTimes', () => {
    describe('when true', () => {
      describe('when time is 00:00', () => {
        it('returns the formatted date and time', () => {
          expect(formatDateWithTime(new Date(2024, 11, 9, 0, 0), { showMidnightTimes: true })).toEqual(
            '9 December 2024 at 00:00',
          )
        })
      })

      describe('when time is 00:01', () => {
        it('returns the formatted date and time', () => {
          expect(formatDateWithTime(new Date(2024, 11, 9, 0, 1), { showMidnightTimes: true })).toEqual(
            '9 December 2024 at 00:01',
          )
        })
      })
    })

    describe('when false', () => {
      describe('when time is 00:00', () => {
        it('returns the formatted date', () => {
          expect(formatDateWithTime(new Date(2024, 11, 9, 0, 0), { showMidnightTimes: false })).toEqual(
            '9 December 2024',
          )
        })
      })

      describe('when time is 00:01', () => {
        it('returns the formatted date and time', () => {
          expect(formatDateWithTime(new Date(2024, 11, 9, 0, 1), { showMidnightTimes: false })).toEqual(
            '9 December 2024 at 00:01',
          )
        })
      })
    })
  })

  describe('when given an invalid date string', () => {
    it('returns the passed in value', () => {
      expect(formatDateWithTime('an invalid date')).toEqual('an invalid date')
    })
  })

  describe('when given undefined', () => {
    it('returns ""', () => {
      expect(formatDateWithTime(undefined)).toEqual('')
    })
  })

  describe('when given null', () => {
    it('returns ""', () => {
      expect(formatDateWithTime(null)).toEqual('')
    })
  })
})
