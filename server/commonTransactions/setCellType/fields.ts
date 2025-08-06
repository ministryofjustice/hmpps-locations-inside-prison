import FormWizard from 'hmpo-form-wizard'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'

const fields: FormWizard.Fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'accommodationType',
    name: 'accommodationType',
    errorMessages: {
      required: 'Select if it is a normal or special accommodation cell',
    },
    items: [
      {
        text: 'Normal accommodation cell',
        value: 'normal',
        hint: {
          text: 'For example, an accessible cell or constant supervision cell.',
        },
      },
      {
        text: 'Special accommodation cell',
        value: 'special',
        hint: {
          text: 'For example, a dry cell or unfurnished cell.',
        },
      },
    ],
    autocomplete: 'off',
  },
}

export default fields
