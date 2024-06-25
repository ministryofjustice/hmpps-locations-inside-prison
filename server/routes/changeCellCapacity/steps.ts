const steps = {
  '/:cellId': {
    entryPoint: true,
    params: ['cellId'],
    fields: ['workingCapacity', 'maximumCapacity'],
    next: 'step2',
  },
  '/step2': {},
}

export default steps
