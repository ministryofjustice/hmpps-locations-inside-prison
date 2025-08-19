import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'accommodationType',
    name: 'accommodationType',
    errorMessages: {
      required: 'Select if it is a normal or special cell type',
    },
    items: [
      {
        text: 'Normal cell type',
        value: 'NORMAL_ACCOMMODATION',
        hint: {
          text: 'For example, an accessible cell or constant supervision cell.',
        },
      },
      {
        text: 'Special cell type',
        value: 'SPECIAL_ACCOMMODATION',
        hint: {
          text: 'For example, a dry cell or unfurnished cell.',
        },
      },
    ],
    autocomplete: 'off',
  },
  specialistCellTypes: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'specialistCellTypes',
    name: 'specialistCellTypes',
    errorMessages: {
      required: 'Select a cell type',
    },
    items: [
      {
        text: 'Biohazard cell',
        value: 'BIOHAZARD_DIRTY_PROTEST',
        hint: {
          text: 'Previously known as a dirty protest cell',
        },
      },
      {
        text: 'Care and separation cell',
        value: 'CSU',
      },
      {
        text: 'Dry cell',
        value: 'DRY',
      },
      {
        text: 'Unfurnished cell',
        value: 'UNFURNISHED',
      },
    ],
    autocomplete: 'off',
  },
  normalCellTypes: {
    component: 'govukCheckboxes',
    multiple: true,
    id: 'normalCellTypes',
    name: 'normalCellTypes',
    validate: ['required'],
    errorMessages: { required: 'Select a cell type' },
    hint: { text: 'Select all that apply.' },
    items: [
      {
        text: 'Accessible cell',
        value: 'ACCESSIBLE_CELL',
        hint: {
          text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
        },
      },
      {
        text: 'Cat A cell',
        value: 'CAT_A',
      },
      {
        text: 'Constant supervision cell',
        value: 'CONSTANT_SUPERVISION',
      },
      {
        text: 'Escape list cell',
        value: 'ESCAPE_LIST',
      },
      {
        text: 'Isolation for communicable diseases cell',
        value: 'ISOLATION_DISEASES',
      },
      {
        text: 'Listener/crisis cell',
        value: 'LISTENER_CRISIS',
      },
      {
        text: 'Locate flat cell',
        value: 'LOCATE_FLAT_CELL',
      },
      {
        text: 'Medical cell',
        value: 'MEDICAL',
      },
      {
        text: 'Mother and baby cell',
        value: 'MOTHER_AND_BABY',
      },
      {
        text: 'Safe cell',
        value: 'SAFE_CELL',
      },
    ],
  },
}

export default fields
