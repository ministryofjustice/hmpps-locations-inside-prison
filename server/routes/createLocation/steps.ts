import Details from '../../controllers/createLocation/details'
import CreateLocationInit from '../../controllers/createLocation/init'
import Structure from '../../controllers/createLocation/structure'
import ConfirmCreateLocation from '../../controllers/createLocation/confirm'
import CellDetails from '../../controllers/createLocation/cellDetails'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    controller: CreateLocationInit,
    next: 'details',
  },
  '/details': {
    editable: true,
    fields: ['locationCode', 'localName', 'createCellsNow'],
    controller: Details,
    template: '../../partials/formStep',
    next: [
      { field: 'createCellsNow', value: 'yes', next: 'create-cells' },
      {
        field: 'createCellsNow',
        value: 'no',
        next: 'confirm',
      },
      'structure',
    ],
  },
  '/create-cells': {
    editable: true,
    fields: ['cellsToCreate', 'accommodationType'],
    controller: CellDetails,
    next: 'door-numbers',
  },
  '/structure': {
    editable: true,
    fields: ['levelType'],
    controller: Structure,
    next: 'confirm',
  },
  '/confirm': {
    controller: ConfirmCreateLocation,
  },
}

export default steps
