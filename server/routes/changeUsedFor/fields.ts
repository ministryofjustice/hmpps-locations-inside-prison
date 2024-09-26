const fields = {
  usedFor: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select what the location is used for' },
    id: 'usedFor',
    name: 'usedFor',
    hint: { text: 'Select all that apply.' },
    items: [{ text: 'set at runtime', value: '' }],
  },
}

export default fields
