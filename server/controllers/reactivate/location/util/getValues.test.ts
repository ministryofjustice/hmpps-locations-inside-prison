import FormWizard from 'hmpo-form-wizard'
import { getValuesForLocation } from './getValues'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'

const mockSessionModel = (values: Record<string, any>) =>
  ({
    get: jest.fn((fieldName?: string) => values[fieldName]),
  }) as any as FormWizard.Request['sessionModel']

describe('getValuesForLocation', () => {
  const baseLocation = LocationFactory.build({
    id: 'loc1',
    capacity: {
      certifiedNormalAccommodation: 10,
      maxCapacity: 20,
      workingCapacity: 15,
    },
    oldWorkingCapacity: 12,
  })

  it('returns values from errorValues if present', () => {
    const sessionModel = mockSessionModel({
      errorValues: {
        'baselineCna-loc1': '99',
        'workingCapacity-loc1': '88',
        'maximumCapacity-loc1': '77',
      },
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(baseLocation, sessionModel)
    expect(result).toEqual({
      'baselineCna-loc1': '99',
      'workingCapacity-loc1': '88',
      'maximumCapacity-loc1': '77',
    })
  })

  it('returns values from temp-capacitiesValues if errorValues not present', () => {
    const sessionModel = mockSessionModel({
      errorValues: {},
      'temp-capacitiesValues': {
        'baselineCna-loc1': '55',
        'workingCapacity-loc1': '66',
        'maximumCapacity-loc1': '77',
      },
    })
    const result = getValuesForLocation(baseLocation, sessionModel)
    expect(result).toEqual({
      'baselineCna-loc1': '55',
      'workingCapacity-loc1': '66',
      'maximumCapacity-loc1': '77',
    })
  })

  it('returns values from sessionModel if neither errorValues nor temp-capacitiesValues present', () => {
    const sessionModel = mockSessionModel({
      errorValues: {},
      'temp-capacitiesValues': {},
      'baselineCna-loc1': '22',
      'workingCapacity-loc1': '33',
      'maximumCapacity-loc1': '44',
    })
    const result = getValuesForLocation(baseLocation, sessionModel)
    expect(result).toEqual({
      'baselineCna-loc1': '22',
      'workingCapacity-loc1': '33',
      'maximumCapacity-loc1': '44',
    })
  })

  it('returns values from location if nothing in sessionModel', () => {
    const sessionModel = mockSessionModel({
      errorValues: {},
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(baseLocation, sessionModel)
    expect(result).toEqual({
      'baselineCna-loc1': '10',
      'workingCapacity-loc1': '12',
      'maximumCapacity-loc1': '20',
    })
  })

  it('works with DecoratedLocation', () => {
    const decoratedLocation = buildDecoratedLocation(baseLocation)
    const sessionModel = mockSessionModel({
      errorValues: {},
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(decoratedLocation, sessionModel)
    expect(result).toEqual({
      'baselineCna-loc1': '10',
      'workingCapacity-loc1': '12',
      'maximumCapacity-loc1': '20',
    })
  })
})
