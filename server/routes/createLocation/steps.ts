import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/createLocation/details'
import CreateLocationInit from '../../controllers/createLocation/init'
import Structure from '../../controllers/createLocation/structure'
import ConfirmCreateLocation from '../../controllers/createLocation/confirm'
import CellDetails from '../../controllers/createLocation/cellDetails'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
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
        fn: (req, _res) => !req.sessionModel.get<string>('locationId'),
        next: 'structure',
      },
      'confirm',
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
