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
  deactivationType: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select if you want to deactivate the location temporarily or permanently' },
    id: 'deactivationType',
    name: 'deactivationType',
    items: [
      {
        text: 'Temporarily deactivate',
        value: 'temporary',
        hint: {
          text: 'For example, if the location is being refurbished or repaired. It will appear as an inactive residential location.',
        },
      },
      {
        text: 'Permanently deactivate',
        value: 'permanent',
        hint: {
          text: 'For example, if the location is being closed or demolished. It will be archived and no longer appear in the list of residential locations.',
        },
      },
    ],
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
  permanentDeactivationReason: {
    component: 'govukInput',
    validate: ['required', maxLength(200)],
    errorMessages: { required: 'Enter a reason for permanently deactivating the location' },
    id: 'permanentDeactivationReason',
    name: 'permanentDeactivationReason',
    label: {
      text: 'Why is the location being permanently deactivated?',
    },
    autocomplete: 'off',
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
