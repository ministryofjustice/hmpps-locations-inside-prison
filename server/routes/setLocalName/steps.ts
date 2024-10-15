import Details from '../../controllers/setLocalName/details'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['localName'],
    controller: Details,
  },
}

export default steps
