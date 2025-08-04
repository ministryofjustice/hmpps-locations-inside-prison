import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import CellNumbers from './cellNumbers'
import CellDoorNumbers from './cellDoorNumbers'

const steps: FormWizard.Steps = {
  '/': {
    editable: true,
    pageTitle: 'Enter cell details',
    fields: ['cellsToCreate', 'accommodationType'],
    controller: BaseController,
    next: 'cell-numbers',
  },
  '/cell-numbers': {
    pageTitle: 'Enter cell numbers',
    template: '../../pages/createLocation/cell-numbers',
    controller: CellNumbers,
    next: 'door-numbers',
  },
  '/door-numbers': {
    pageTitle: 'Enter cell door numbers',
    controller: CellDoorNumbers,
    template: '../../commonTransactions/createCells/doorNumbers',
  },
}

export default steps
