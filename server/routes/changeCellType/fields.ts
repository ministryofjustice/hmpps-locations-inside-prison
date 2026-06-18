const fields = {
  specialistCellTypes: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    id: 'specialistCellTypes',
    name: 'specialistCellTypes',
    errorMessages: {
      required: 'Select a cell type',
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
}

export default fields
