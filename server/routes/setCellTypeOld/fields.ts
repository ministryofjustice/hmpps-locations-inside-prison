const fields = {
  specialistCellTypes: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select a cell type' },
    id: 'specialistCellTypes',
    name: 'specialistCellTypes',
    label: {
      text: 'Set specific cell type',
    },
    hint: {
      text: 'Select all that apply.',
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
}

export default fields
