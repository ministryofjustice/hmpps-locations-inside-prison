import Details from '../../controllers/createLocation/details'

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
    next: ['structure'],
  },
}

export default steps
