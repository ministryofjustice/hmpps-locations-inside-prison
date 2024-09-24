import validateDateInput from './validateDateInput'

function test(day: string | number, month: string | number, year: string | number, error: string) {
  expect(
    validateDateInput(
      day.toString(),
      month.toString(),
      year.toString(),
      [
        year,
        month !== '' ? month.toString().padStart(2, '0') : '',
        day !== '' ? day.toString().padStart(2, '0') : '',
      ].join('-'),
    ),
  ).toBe(error)
}

describe('Field helpers', () => {
  describe('#validateDateInput', () => {
    describe('when any part of the date is blank', () => {
      it('returns the correct error', () => {
        test('', 1, 2024, 'dateMissingDay')
        test('', '', 2024, 'dateMissingDayAndMonth')
        test('', 1, '', 'dateMissingDayAndYear')
        test(1, '', 2024, 'dateMissingMonth')
        test(1, '', '', 'dateMissingMonthAndYear')
        test(1, 1, '', 'dateMissingYear')
      })
    })

    describe('when an invalid day is supplied', () => {
      it('returns dateInvalidDay', () => {
        // day > 0 && day < 32
        test(NaN, 1, 2024, 'dateInvalidDay')
        test(-2, 1, 2024, 'dateInvalidDay')
        test(0, 1, 2024, 'dateInvalidDay')
        test(1, 1, 2024, '')
        test(31, 1, 2024, '')
        test(32, 1, 2024, 'dateInvalidDay')

        // day doesn't exist in the given month
        test(28, 2, 2023, '')
        test(29, 2, 2023, 'dateInvalidDay')
        test(29, 2, 2024, '') // leap year
        test(30, 2, 2024, 'dateInvalidDay') // leap year
      })
    })

    describe('when an invalid month is supplied', () => {
      it('returns dateInvalidMonth', () => {
        // month > 0 && month < 13
        test(1, NaN, 2024, 'dateInvalidMonth')
        test(1, -1, 2024, 'dateInvalidMonth')
        test(1, 0, 2024, 'dateInvalidMonth')
        test(1, 1, 2024, '')
        test(1, 12, 2024, '')
        test(1, 13, 2024, 'dateInvalidMonth')

        // multiple invalid fields
        test(NaN, NaN, 2024, 'dateInvalid')
        test(1, NaN, NaN, 'dateInvalid')
      })
    })

    describe('when an invalid year is supplied', () => {
      it('returns dateInvalidYear', () => {
        test(1, 1, NaN, 'dateInvalidYear')

        // multiple invalid fields
        test(1, NaN, NaN, 'dateInvalid')
        test(NaN, 1, NaN, 'dateInvalid')
      })
    })
  })
})
