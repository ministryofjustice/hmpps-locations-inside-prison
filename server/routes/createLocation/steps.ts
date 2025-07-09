import Details from '../../controllers/createLocation/details'
import Structure from '../../controllers/createLocation/structure'

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
  '/confirm': {},
}

export default steps
