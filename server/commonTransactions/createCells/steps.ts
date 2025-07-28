import FormWizard from 'hmpo-form-wizard'
import CellDetails from './cellDetails'

const steps: FormWizard.Steps = {
  '/': {
    editable: true,
    pageTitle: 'Enter cell details',
    fields: ['cellsToCreate', 'accommodationType'],
    controller: CellDetails,
    next: 'door-numbers',
  },
  '/door-numbers': {
    pageTitle: 'DOOR_NUMBERS',
  },
}

export default steps
