import minLength from '../../validators/minLength'

const fields = {
  deactivationReason: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'deactivationReason',
    name: 'deactivationReason',
    label: {
      text: 'Deactivation reason',
    },
    fieldset: {
      legend: {
        text: 'Deactivation reason',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  deactivationReasonOther: {
    component: 'govukInput',
    validate: ['required'],
    id: 'deactivationReasonOther',
    name: 'deactivationReasonOther',
    label: {
      text: 'Describe deactivation reason',
    },
    fieldset: {
      legend: {
        text: 'Describe deactivation reason',
        classes: 'govuk-fieldset__legend--m',
      },
    },
  },
  estimatedReactivationDate: {
    component: 'govukDateInput',
    id: 'estimatedReactivationDate',
    name: 'estimatedReactivationDate',
    label: {
      text: 'Estimated reactivation date (optional)',
    },
    fieldset: {
      legend: {
        text: 'Estimated reactivation date (optional)',
        classes: 'govuk-fieldset__legend--m',
      },
    },
  },
  planetFmReference: {
    component: 'govukInput',
    validate: [
      {
        fn: minLength,
        arguments: [6],
      },
    ],
    id: 'planetFmReference',
    name: 'planetFmReference',
    classes: 'govuk-input--width-10',
    label: {
      text: 'Planet FM reference number (optional)',
      classes: 'govuk-label--m',
    },
  },
}

export default fields
