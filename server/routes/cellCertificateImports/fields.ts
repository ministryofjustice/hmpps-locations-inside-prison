const fields = {
  file: {
    component: 'govukFileUpload',
    id: 'file',
    name: 'file',
    label: {
      text: 'Upload a file',
    },
    javascript: true,
    errorMessages: {
      required: 'Select a file',
      parseFailure: 'The uploaded file is not in the correct format',
      invalidPrison: 'The data in the upload does not match the prison selected',
      noData: 'Add at least one row of data',
    },
  },
  capacityData: {
    name: 'capacityData',
    value: 'runtime',
  },
  capacitySummary: {
    name: 'capacitySummary',
    value: 'runtime',
  },
}

export default fields
