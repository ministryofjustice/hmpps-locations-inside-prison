import removeLocalName from '../../controllers/removeLocalName/check'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['check'],
    controller: removeLocalName,
  },
}

export default steps
