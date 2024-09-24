import FormWizard from 'hmpo-form-wizard'
import setStepValidity from './setStepValidity'

describe('setStepValidity', () => {
  const initialJourneyHistory = (): any[] => [
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-type',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity',
      fields: ['specialistCellTypes'],
      formFields: ['specialistCellTypes'],
      wizard: 'cell-conversion',
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/confirm',
      fields: ['workingCapacity', 'maxCapacity'],
      formFields: ['workingCapacity', 'maxCapacity'],
      wizard: 'cell-conversion',
    },
  ]

  const req: FormWizard.Request = {
    // @ts-ignore
    journeyModel: {
      get: jest.fn().mockImplementation(key => (key === 'history' ? initialJourneyHistory() : undefined)),
      set: jest.fn(),
    },
  }

  it('sets the step validity', () => {
    const newJourneyHistory = initialJourneyHistory()
    newJourneyHistory[1].invalid = true
    newJourneyHistory[1].revalidate = true

    setStepValidity(req, 'set-cell-capacity', false)
    expect(req.journeyModel.set).toHaveBeenCalledWith('history', newJourneyHistory)
  })
})
