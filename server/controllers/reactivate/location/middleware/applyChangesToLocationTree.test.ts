import { NextFunction } from 'express'
import applyChangesToLocationTree from './applyChangesToLocationTree'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'
import { LocationsApiConstant } from '../../../../data/types/locationsApi'

const mockSessionModel = (values: Record<string, any>) => ({
  get: (key: string) => values[key],
})

describe('applyChangesToLocationTree', () => {
  let req: any
  let res: any
  let next: NextFunction
  let specialistCellTypes: LocationsApiConstant[]

  beforeEach(() => {
    req = { sessionModel: mockSessionModel({}) }
    res = { locals: {} }
    next = jest.fn()
    specialistCellTypes = [
      { key: 'TYPE1', description: 'Type 1' },
      { key: 'TYPE2', description: 'Type 2' },
    ]
    res.locals.constants = { specialistCellTypes }
  })

  it('applies changes to a simple LocationTree', () => {
    const cell = LocationFactory.build({
      id: 'cell1',
      locationType: 'CELL',
      capacity: { certifiedNormalAccommodation: 0, maxCapacity: 0, workingCapacity: 0 },
      oldWorkingCapacity: 0,
      specialistCellTypes: ['TYPE1'],
    })
    res.locals.locationTree = [{ location: cell, subLocations: [] }]
    req.sessionModel = mockSessionModel({
      'baselineCna-cell1': '10',
      'workingCapacity-cell1': '15',
      'maximumCapacity-cell1': '20',
      'temp-cellTypescell1': ['TYPE2'],
    })
    applyChangesToLocationTree(req, res, next)
    expect(cell.capacity.certifiedNormalAccommodation).toBe(10)
    expect(cell.oldWorkingCapacity).toBe(15)
    expect(cell.capacity.maxCapacity).toBe(20)
    expect(cell.specialistCellTypes).toEqual(['TYPE2'])
    expect(next).toHaveBeenCalled()
  })

  it('applies changes to a DecoratedLocationTree', () => {
    const cell = LocationFactory.build({
      id: 'cell2',
      locationType: 'CELL',
      capacity: { certifiedNormalAccommodation: 0, maxCapacity: 0, workingCapacity: 0 },
      oldWorkingCapacity: 0,
      specialistCellTypes: ['TYPE1'],
    })
    const decorated = buildDecoratedLocation({
      ...cell,
      specialistCellTypes: ['TYPE1'],
    })
    res.locals.decoratedLocationTree = [{ decoratedLocation: decorated, decoratedSubLocations: [] }]
    req.sessionModel = mockSessionModel({
      'baselineCna-cell2': '5',
      'workingCapacity-cell2': '6',
      'maximumCapacity-cell2': '7',
      'temp-cellTypescell2': ['TYPE1'],
    })
    applyChangesToLocationTree(req, res, next)
    expect(decorated.capacity.certifiedNormalAccommodation).toBe(5)
    expect(decorated.oldWorkingCapacity).toBe(6)
    expect(decorated.capacity.maxCapacity).toBe(7)
    expect(decorated.specialistCellTypes).toEqual(['Type 1'])
    expect(next).toHaveBeenCalled()
  })

  it('handles cellTypes removal flags', () => {
    const cell = LocationFactory.build({
      id: 'cell3',
      locationType: 'CELL',
      capacity: { certifiedNormalAccommodation: 0, maxCapacity: 0, workingCapacity: 0 },
      oldWorkingCapacity: 0,
      specialistCellTypes: ['TYPE1'],
    })
    res.locals.locationTree = [{ location: cell, subLocations: [] }]
    req.sessionModel = mockSessionModel({
      'baselineCna-cell3': '1',
      'workingCapacity-cell3': '2',
      'maximumCapacity-cell3': '3',
      'temp-cellTypescell3-removed': true,
    })
    applyChangesToLocationTree(req, res, next)
    expect(cell.specialistCellTypes).toEqual([])
    expect(next).toHaveBeenCalled()
  })

  it('does not apply changes to non-cell locations', () => {
    const wing = LocationFactory.build({
      id: 'wing1',
      locationType: 'WING',
      capacity: { certifiedNormalAccommodation: 0, maxCapacity: 0, workingCapacity: 0 },
      oldWorkingCapacity: 0,
      specialistCellTypes: [],
    })
    res.locals.locationTree = [{ location: wing, subLocations: [] }]
    req.sessionModel = mockSessionModel({})
    applyChangesToLocationTree(req, res, next)
    expect(wing.capacity.certifiedNormalAccommodation).toBe(0)
    expect(wing.oldWorkingCapacity).toBe(0)
    expect(wing.capacity.maxCapacity).toBe(0)
    expect(next).toHaveBeenCalled()
  })

  it('handles missing cellTypes gracefully', () => {
    const cell = LocationFactory.build({
      id: 'cell4',
      locationType: 'CELL',
      capacity: { certifiedNormalAccommodation: 0, maxCapacity: 0, workingCapacity: 0 },
      oldWorkingCapacity: 0,
      specialistCellTypes: undefined,
    })
    res.locals.locationTree = [{ location: cell, subLocations: [] }]
    req.sessionModel = mockSessionModel({})
    applyChangesToLocationTree(req, res, next)
    expect(cell.specialistCellTypes).toEqual([])
    expect(next).toHaveBeenCalled()
  })
})
