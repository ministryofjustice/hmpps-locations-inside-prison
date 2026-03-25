import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  confirmation: {
    component: 'govukCheckboxes',
    multiple: false,
    validate: ['required'],
    errorMessages: { required: 'Confirm that the cells meet the certification standards' },
    id: 'confirmation',
    name: 'confirmation',
    label: {
      text: 'Confirm cell meets certification standards',
    },
    fieldset: {
      legend: {
        text: 'Confirm cell meets certification standards',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    hint: {
      text: 'In pursuance of section 14 of the Prison Act 1952 and the Prison Rules/Young Offender Institution Rules, I hereby confirm that the cells, rooms, cubicles, dormitories or wards shown here are of such size and are lighted, heated, ventilated and equipped in such a manner as is requisite for health, and that they are furnished with the means of enabling the prisoner(s) to communicate at any time with an officer of the establishment.',
    },
    items: [
      {
        text: 'I understand and agree with the above statement.',
        value: 'yes',
      },
    ],
  },
}

export default fields
