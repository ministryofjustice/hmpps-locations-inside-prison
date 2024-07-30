import { formatISO } from 'date-fns'
import dateInFuture from './dateInFuture'

describe('dateInFuture', () => {
  describe('when comparing to a static value', () => {
    it('allows dates in the future', () => {
      const date = new Date()
      date.setHours(0)
      date.setMinutes(0)
      date.setDate(date.getDate() + 1)
      expect(dateInFuture(formatISO(date))).toEqual(true)
    })

    it("forbids today's date", () => {
      const date = new Date()
      date.setHours(0)
      date.setMinutes(0)
      expect(dateInFuture(formatISO(date))).toEqual(false)
    })

    it('forbids past dates', () => {
      const date = new Date()
      date.setHours(0)
      date.setMinutes(0)
      date.setDate(date.getDate() - 1)
      expect(dateInFuture(formatISO(date))).toEqual(false)
    })
  })
})
