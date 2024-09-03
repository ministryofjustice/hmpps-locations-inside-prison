import greaterThan from '../../validators/greaterThan'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'

const fields = {
  workingCapacity: {
    component: 'govukInput',
    validate: ['required', 'numeric', lessThanOrEqualTo(99), lessThanOrEqualTo({ field: 'maxCapacity' })],
    id: 'workingCapacity',
    name: 'workingCapacity',
    classes: 'govuk-input--width-2',
    label: {
      text: 'Working capacity',
      classes: 'govuk-label--s',
    },
    hint: {
      text: 'The number of people that can currently live in this location based on available beds, furniture and sanitation.',
    },
    autocomplete: 'off',
  },
  maxCapacity: {
    component: 'govukInput',
    validate: ['required', 'numeric', greaterThan(0), lessThanOrEqualTo(99)],
    errorMessages: { greaterThan: 'Maximum capacity cannot be 0' },
    id: 'maxCapacity',
    name: 'maxCapacity',
    classes: 'govuk-input--width-2',
    label: {
      text: 'Maximum capacity',
      classes: 'govuk-label--s',
    },
    hint: {
      text: 'The maximum number of people that could potentially live in this location.',
    },
    autocomplete: 'off',
  },
}

export default fields
