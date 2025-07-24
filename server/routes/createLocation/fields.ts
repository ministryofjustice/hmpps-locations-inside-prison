import FormWizard from 'hmpo-form-wizard'
import maxLength from '../../validators/maxLength'
import alphanumeric from '../../validators/alphanumeric'

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
      if (decoratedResidentialSummary.location) {
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
