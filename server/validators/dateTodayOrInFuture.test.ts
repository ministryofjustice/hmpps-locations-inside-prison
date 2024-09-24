import { formatISO } from 'date-fns'
import dateTodayOrInFuture from './dateTodayOrInFuture'

describe('dateTodayOrInFuture', () => {
  it('allows dates in the future', () => {
    const date = new Date()
    date.setHours(0)
    date.setMinutes(0)
    date.setDate(date.getDate() + 1)
    expect(dateTodayOrInFuture(formatISO(date))).toEqual(true)
  })

  it("allows today's date", () => {
    const date = new Date()
    date.setHours(0)
    date.setMinutes(0)
    expect(dateTodayOrInFuture(formatISO(date))).toEqual(true)
  })

  it('forbids past dates', () => {
    const date = new Date()
    date.setHours(0)
    date.setMinutes(0)
    date.setDate(date.getDate() - 1)
    expect(dateTodayOrInFuture(formatISO(date))).toEqual(false)
  })
})
