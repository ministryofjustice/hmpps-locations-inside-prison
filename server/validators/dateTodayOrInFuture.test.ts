import { startOfTomorrow, startOfToday, startOfYesterday } from 'date-fns'
import dateTodayOrInFuture from './dateTodayOrInFuture'

describe('dateTodayOrInFuture', () => {
  it('allows dates in the future', () => {
    const tomorrow = startOfTomorrow()
    const tomorrowAsString = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`
    expect(dateTodayOrInFuture(tomorrowAsString)).toEqual(true)
  })

  it("allows today's date", () => {
    const today = startOfToday()
    const todayAsString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    expect(dateTodayOrInFuture(todayAsString)).toEqual(true)
  })

  it('forbids recent past dates', () => {
    const yesterday = startOfYesterday()
    const yesterdayAsString = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
    expect(dateTodayOrInFuture(yesterdayAsString)).toEqual(false)
  })

  it('forbids really old past dates', () => {
    const reallyOldDate = '1066-1-10'
    expect(dateTodayOrInFuture(reallyOldDate)).toEqual(false)
  })
})
