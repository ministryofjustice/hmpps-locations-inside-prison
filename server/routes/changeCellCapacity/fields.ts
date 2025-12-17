import FormWizard from 'hmpo-form-wizard'
import greaterThan from '../../validators/greaterThan'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import canEditCna from '../../utils/canEditCna'

const fields: FormWizard.Fields = {
  baselineCna: {
    remove: (_req, res) => !canEditCna(res.locals.prisonConfiguration, res.locals.decoratedLocation),
    hideWhenRemoved: true,
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      greaterThan: 'Baseline certified normal accommodation (CNA) cannot be 0 for a non-special cell',
    },
    component: 'govukInput',
    id: 'baselineCna',
    name: 'baselineCna',
    label: {
      text: 'Baseline certified normal accommodation (CNA)',
      classes: 'govuk-label--s',
    },
    classes: 'govuk-input--width-2',
    hint: {
      text: 'The number of people that can live in this location without it being considered overcrowded.',
    },
    autocomplete: 'off',
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
