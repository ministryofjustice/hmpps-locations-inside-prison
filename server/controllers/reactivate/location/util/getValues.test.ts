import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import { Response } from 'express'
import { getValues, getValuesForLocation } from './getValues'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'
import mockModel from '../../../../testutils/mockModel'

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

  let req: DeepPartial<FormWizard.Request>

  beforeEach(() => {
    req = { form: { values: {} }, sessionModel: mockModel() }
  })

  it('returns values from the form if present', () => {
    req.form.values = {
      'baselineCna-loc1': '99',
      'workingCapacity-loc1': '88',
      'maximumCapacity-loc1': '77',
    }
    const result = getValuesForLocation(baseLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '99',
      'workingCapacity-loc1': '88',
      'maximumCapacity-loc1': '77',
    })
  })

  it('returns values from errorValues if present', () => {
    req.sessionModel = mockModel({
      errorValues: {
        'baselineCna-loc1': '99',
        'workingCapacity-loc1': '88',
        'maximumCapacity-loc1': '77',
      },
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(baseLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '99',
      'workingCapacity-loc1': '88',
      'maximumCapacity-loc1': '77',
    })
  })

  it('returns values from temp-capacitiesValues if errorValues not present', () => {
    req.sessionModel = mockModel({
      errorValues: {},
      'temp-capacitiesValues': {
        'baselineCna-loc1': '55',
        'workingCapacity-loc1': '66',
        'maximumCapacity-loc1': '77',
      },
    })
    const result = getValuesForLocation(baseLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '55',
      'workingCapacity-loc1': '66',
      'maximumCapacity-loc1': '77',
    })
  })

  it('returns values from sessionModel if neither errorValues nor temp-capacitiesValues present', () => {
    req.sessionModel = mockModel({
      errorValues: {},
      'temp-capacitiesValues': {},
      'baselineCna-loc1': '22',
      'workingCapacity-loc1': '33',
      'maximumCapacity-loc1': '44',
    })
    const result = getValuesForLocation(baseLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '22',
      'workingCapacity-loc1': '33',
      'maximumCapacity-loc1': '44',
    })
  })

  it('returns values from location if nothing in sessionModel', () => {
    req.sessionModel = mockModel({
      errorValues: {},
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(baseLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '10',
      'workingCapacity-loc1': '12',
      'maximumCapacity-loc1': '20',
    })
  })

  it('works with DecoratedLocation', () => {
    const decoratedLocation = buildDecoratedLocation(baseLocation)
    req.sessionModel = mockModel({
      errorValues: {},
      'temp-capacitiesValues': {},
    })
    const result = getValuesForLocation(decoratedLocation, req as FormWizard.Request)
    expect(result).toEqual({
      'baselineCna-loc1': '10',
      'workingCapacity-loc1': '12',
      'maximumCapacity-loc1': '20',
    })
  })
})

describe('getValues', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>

  beforeEach(() => {
    req = { form: { values: {} }, sessionModel: mockModel() }
    res = { locals: {} }
  })

  it('returns values for all cells in cells', () => {
    const cell1 = LocationFactory.build({
      id: 'cell1',
      capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 3 },
      oldWorkingCapacity: 4,
      locationType: 'CELL',
    })
    const cell2 = LocationFactory.build({
      id: 'cell2',
      capacity: { certifiedNormalAccommodation: 5, maxCapacity: 6, workingCapacity: 7 },
      oldWorkingCapacity: 8,
      locationType: 'CELL',
    })
    res.locals.cells = [cell1, cell2]
    const result = getValues(req as FormWizard.Request, res as Response)
    expect(result).toEqual({
      'baselineCna-cell1': '1',
      'workingCapacity-cell1': '4',
      'maximumCapacity-cell1': '2',
      'baselineCna-cell2': '5',
      'workingCapacity-cell2': '8',
      'maximumCapacity-cell2': '6',
    })
  })

  it('returns values for all cells in decoratedCells', () => {
    const cell1 = buildDecoratedLocation({
      id: 'cell1',
      capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 3 },
      oldWorkingCapacity: 4,
      locationType: 'CELL',
    })
    const cell2 = buildDecoratedLocation({
      id: 'cell2',
      capacity: { certifiedNormalAccommodation: 5, maxCapacity: 6, workingCapacity: 7 },
      oldWorkingCapacity: 8,
      locationType: 'CELL',
    })
    res.locals.decoratedCells = [cell1, cell2]
    const result = getValues(req as FormWizard.Request, res as Response)
    expect(result).toEqual({
      'baselineCna-cell1': '1',
      'workingCapacity-cell1': '4',
      'maximumCapacity-cell1': '2',
      'baselineCna-cell2': '5',
      'workingCapacity-cell2': '8',
      'maximumCapacity-cell2': '6',
    })
  })

  it('returns empty object if no trees present', () => {
    res.locals.cells = undefined
    res.locals.decoratedCells = undefined
    const result = getValues(req as FormWizard.Request, res as Response)
    expect(result).toEqual({})
  })
})
