import FormWizard from 'hmpo-form-wizard'
import maxLength from '../../validators/maxLength'
import alphanumeric from '../../validators/alphanumeric'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'

const fields: FormWizard.Fields = {
  locationCode: {
    validate: ['required', alphanumeric, maxLength(5)],
    component: 'govukInput',
    errorMessages: {
      alphanumeric: ':fieldName can only include numbers or letters',
    },
    id: 'locationCode',
    name: 'locationCode',
    classes: 'govuk-input--width-5 local-name-text-input',
    rows: 1,
    label: {
      text: '',
      classes: 'govuk-label--m',
      for: 'locationCode',
    },
    hint: {
      text: 'Set at runtime',
    },
    autocomplete: 'off',
  },
  localName: {
    component: 'govukCharacterCount',
    validate: [maxLength(30)],
    maxlength: 30,
    errorMessages: {
      taken: 'A location with this name already exists',
    },
    id: 'localName',
    name: 'localName',
    classes: 'govuk-!-width-one-half local-name-text-input',
    rows: 1,
    label: {
      text: 'Local name (optional)',
      classes: 'govuk-label--m',
      for: 'localName',
    },
    hint: {
      text: 'This will change how the name displays on location lists but won’t change the location code.',
    },
    autocomplete: 'off',
  },
  createCellsNow: {
    component: 'govukRadios',
    validate: ['required'],
    remove: (req, res) => {
      const { sessionModel } = req
      if (!sessionModel.get<string>('locationId')) {
        return true
      }

      const { decoratedResidentialSummary } = res.locals
      if (decoratedResidentialSummary.wingStructure && decoratedResidentialSummary.location) {
        const locationType = sessionModel.get<string>('locationType')
        const currentTypeIndex = decoratedResidentialSummary.wingStructure.indexOf(locationType)
        const childType = decoratedResidentialSummary.wingStructure[currentTypeIndex + 1]

        return childType !== 'CELL'
      }

      return false
    },
    hideWhenRemoved: true,
    id: 'createCellsNow',
    name: 'createCellsNow',
    errorMessages: {
      required: 'Select yes if you want to create cells now',
    },
    fieldset: {
      legend: {
        text: 'Do you want to create cells on the LOCATION_TYPE now?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Yes', value: 'yes' },
      { text: "No, I'll create them later", value: 'no' },
    ],
    autocomplete: 'off',
  },
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    hideWhenRemoved: true,
    id: 'accommodationType',
    name: 'accommodationType',
    errorMessages: {
      required: 'Select an accommodation type',
    },
    fieldset: {
      legend: {
        text: 'Accommodation type',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Normal accommodation', value: 'NORMAL_ACCOMMODATION' },
      { text: 'Care and separation', value: 'CARE_AND_SEPARATION' },
      { text: 'Healthcare inpatients', value: 'HEALTHCARE_INPATIENTS' },
    ],
    autocomplete: 'off',
  },
  cellsToCreate: {
    validate: ['required', 'numeric', lessThanOrEqualTo(999)],
    component: 'govukInput',
    errorMessages: {
      required: 'Enter how many cells you want to create',
      numeric: 'Cells must be a number',
      lessThanOrEqualTo: 'You can create a maximum of 999 cells at once',
    },
    id: 'cellsToCreate',
    name: 'cellsToCreate',
    classes: 'govuk-input--width-5',
    rows: 1,
    label: {
      text: 'How many cells do you want to create?',
      classes: 'govuk-label--m',
      for: 'cellsToCreate',
    },
    autocomplete: 'off',
  },
  levelType: {
    component: 'govukSelect',
    errorMessages: {},
    id: 'levelType',
    name: 'levelType',
    items: [
      {
        value: 'Set at runtime',
        text: 'Set at runtime',
      },
    ],
  },
}

export default fields
