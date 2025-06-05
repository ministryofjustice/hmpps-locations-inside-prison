import FormWizard from 'hmpo-form-wizard'
import greaterThan from '../../../validators/greaterThan'
import lessThanOrEqualTo from '../../../validators/lessThanOrEqualTo'

const fields = {
  selectLocations: {
    component: 'govukCheckboxes',
    fieldset: {
      legend: {
        text: 'Select the CHILD_TYPE you want to activate',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select which CHILD_TYPE you want to activate' },
    id: 'selectLocations',
    name: 'selectLocations',
    items: [{ text: 'set at runtime', value: '' }],
  },
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
    remove: (req: FormWizard.Request) => !req.canAccess('change_max_capacity'),
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
