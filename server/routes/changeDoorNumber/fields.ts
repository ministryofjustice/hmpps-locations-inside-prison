import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  doorNumber: {
    errorMessages: {
      notUnique: 'A cell with this door number already exists',
      taken: 'A cell with this door number already exists',
    },
    validate: ['required'],
    component: 'govukInput',
    hint: {
      text: 'This is the actual number written on the cell door.',
    },
    label: {
      text: 'Door number',
      classes: 'govuk-visually-hidden',
      for: 'doorNumber',
    },
    id: 'doorNumber',
    name: 'doorNumber',
    classes: 'govuk-input--width-5',
    rows: 1,
    autocomplete: 'off',
  },
}

export default fields
