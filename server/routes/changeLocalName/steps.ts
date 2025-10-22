import Details from '../../controllers/changeLocalName/details'

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
    layout: '../../partials/formStep',
  },
}

export default steps
