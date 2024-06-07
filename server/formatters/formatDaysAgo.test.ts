import formatDaysAgo from './formatDaysAgo'

describe('formatTime', () => {
  describe('when date is today', () => {
    const date = new Date()
    describe('when given a string date', () => {
      it('returns "Today"', () => {
        expect(formatDaysAgo(date.toISOString())).toEqual('Today')
      })
    })

    describe('when given a Date date', () => {
      it('returns "Today"', () => {
        expect(formatDaysAgo(date)).toEqual('Today')
      })
    })
  })

  describe('when date is yesterday', () => {
    const date = new Date()
    date.setDate(date.getDate() - 1)

    describe('when given a string date', () => {
      it('returns "1 day ago"', () => {
        expect(formatDaysAgo(date.toISOString())).toEqual('1 day ago')
      })
    })

    describe('when given a Date date', () => {
      it('returns "1 day ago"', () => {
        expect(formatDaysAgo(date)).toEqual('1 day ago')
      })
    })
  })

  describe('when date is 5 days ago', () => {
    const date = new Date()
    date.setDate(date.getDate() - 5)

    describe('when given a string date', () => {
      it('returns "5 days ago"', () => {
        expect(formatDaysAgo(date.toISOString())).toEqual('5 days ago')
      })
    })

    describe('when given a Date date', () => {
      it('returns "5 days ago"', () => {
        expect(formatDaysAgo(date)).toEqual('5 days ago')
      })
    })
  })

  describe('when given an invalid date string', () => {
    it('returns the passed in value', () => {
      expect(formatDaysAgo('an invalid date')).toEqual('an invalid date')
    })
  })

  describe('when given undefined', () => {
    it('returns ""', () => {
      expect(formatDaysAgo(undefined)).toEqual('')
    })
  })

  describe('when given null', () => {
    it('returns ""', () => {
      expect(formatDaysAgo(null)).toEqual('')
    })
  })
})
