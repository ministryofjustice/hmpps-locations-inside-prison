import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  inCellSanitation: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'inCellSanitation',
    name: 'inCellSanitation',
    errorMessages: {
      required: 'Select yes if the cell has in-cell sanitation',
    },
    items: [
      { text: 'Yes', value: 'YES' },
      { text: 'No', value: 'NO' },
    ],
    autocomplete: 'off',
    hint: {
      text: 'This means the cell includes both a toilet and wash basin.',
    },
  },
}

export default fields
