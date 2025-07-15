import Details from '../../controllers/createLocation/details'
import Structure from '../../controllers/createLocation/structure'
import ConfirmCreateLocation from '../../controllers/createLocation/confirm'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    editable: true,
    fields: ['locationCode', 'localName'],
    controller: Details,
    next: 'structure',
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
