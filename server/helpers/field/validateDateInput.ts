export default function validateDateInput(
  dayInputValue: string,
  monthInputValue: string,
  yearInputValue: string,
  isoDate: string,
) {
  const missingFields = []
  if (dayInputValue === '') {
    missingFields.push('Day')
  }
  if (monthInputValue === '') {
    missingFields.push('Month')
  }
  if (yearInputValue === '') {
    missingFields.push('Year')
  }
  if (missingFields.length) {
    return `dateMissing${missingFields.join('And')}`
  }

  const day = Number(dayInputValue)
  const month = Number(monthInputValue)
  const year = Number(yearInputValue)
  const estimatedReactivationDate = new Date(isoDate as string)
  let invalidField: string
  if (
    !Number.isFinite(day) ||
    day <= 0 ||
    day > 31 ||
    (Number.isFinite(estimatedReactivationDate.getTime()) && estimatedReactivationDate.getDate() !== day)
  ) {
    invalidField = 'Day'
  }
  if (!Number.isFinite(month) || month <= 0 || month > 12) {
    invalidField = invalidField ? '*' : 'Month'
  }
  if (!Number.isFinite(year)) {
    invalidField = invalidField ? '*' : 'Year'
  }

  if (invalidField || Number.isNaN(estimatedReactivationDate.getTime())) {
    return invalidField === '*' || !invalidField ? 'dateInvalid' : `dateInvalid${invalidField}`
  }

  return ''
}
