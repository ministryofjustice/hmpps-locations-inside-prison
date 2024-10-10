import dateTodayOrInFuture from '../../validators/dateTodayOrInFuture'
import maxLength from '../../validators/maxLength'
import minLength from '../../validators/minLength'
import numericString from '../../validators/numericString'

const fields = {
  deactivationReason: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'deactivationReason',
    name: 'deactivationReason',
    errorMessages: { required: 'Select a deactivation reason' },
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
    autocomplete: 'off',
  },
  deactivationReasonOther: {
    component: 'govukInput',
    validate: ['required', maxLength(255)],
    id: 'deactivationReasonOther',
    name: 'deactivationReasonOther',
    label: {
      text: 'Describe deactivation reason',
    },
    nameForErrors: 'Deactivation reason',
    autocomplete: 'off',
  },
  deactivationReasonDescription: {
    component: 'govukInput',
    // TODO: fix this only validating on the last field of this type
    validate: [maxLength(255)],
    id: 'deactivationReasonDescription',
    name: 'deactivationReasonDescription',
    label: {
      text: 'Description (optional)',
    },
    nameForErrors: 'Description',
    autocomplete: 'off',
  },
  estimatedReactivationDate: {
    component: 'govukDateInput',
    validate: [dateTodayOrInFuture],
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
    nameForErrors: 'Estimated reactivation date',
  },
  planetFmReference: {
    component: 'govukInput',
    validate: [minLength(6), maxLength(18), numericString],
    id: 'planetFmReference',
    name: 'planetFmReference',
    classes: 'govuk-input--width-10',
    label: {
      text: 'Planet FM reference number (optional)',
      classes: 'govuk-label--m',
    },
    nameForErrors: 'Planet FM reference number',
    autocomplete: 'off',
  },
}

export default fields
