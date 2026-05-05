import { DeepPartial } from 'fishery'
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import populateModifiedLocationMap from './populateModifiedLocationMap'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'

const mockModel = (originalValues: Record<string, any> = {}) => {
  const values = { ...originalValues }

  return {
    get: jest.fn((fieldName?: string) => values[fieldName]),
    set: jest.fn((fieldName?: string, value?: any) => {
      values[fieldName] = value
    }),
    unset: jest.fn((fieldName?: string) => {
      delete values[fieldName]
    }),
    toJSON: jest.fn(() => values),
  } as any as FormWizard.Request['sessionModel']
}

describe('populateModifiedLocationMap', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>
  let next: jest.Mock

  beforeEach(() => {
    req = {
      sessionModel: mockModel(),
      form: { values: {} },
    }
    res = {
      locals: {},
    }
    next = jest.fn()
  })

  it('populates modifiedLocationMap from cells', () => {
    const cell1 = LocationFactory.build({ id: 'cell1', locationType: 'CELL', specialistCellTypes: ['TYPE1'] })
    const cell2 = LocationFactory.build({ id: 'cell2', locationType: 'CELL', specialistCellTypes: [] })
    res.locals.cells = [cell1, cell2]
    populateModifiedLocationMap(req as FormWizard.Request, res as Response, next)
    expect(res.locals.modifiedLocationMap).toBeDefined()
    expect(res.locals.modifiedLocationMap.cell1.specialistCellTypes).toEqual(['TYPE1'])
    expect(res.locals.modifiedLocationMap.cell2.specialistCellTypes).toEqual([])
    expect(next).toHaveBeenCalled()
  })

  it('populates modifiedLocationMap from decoratedCells', () => {
    const cell1 = buildDecoratedLocation({ id: 'cell1', locationType: 'CELL', specialistCellTypes: ['TYPE1'] })
    const cell2 = buildDecoratedLocation({ id: 'cell2', locationType: 'CELL', specialistCellTypes: [] })
    res.locals.decoratedCells = [cell1, cell2]
    populateModifiedLocationMap(req as FormWizard.Request, res as Response, next)
    expect(res.locals.modifiedLocationMap).toBeDefined()
    expect(res.locals.modifiedLocationMap.cell1.specialistCellTypes).toEqual(['TYPE1'])
    expect(res.locals.modifiedLocationMap.cell2.specialistCellTypes).toEqual([])
    expect(next).toHaveBeenCalled()
  })

  it('applies temp and saved cellTypes from sessionModel', () => {
    const cell1 = LocationFactory.build({ id: 'cell1', locationType: 'CELL', specialistCellTypes: ['TYPE1'] })
    const cell2 = LocationFactory.build({ id: 'cell2', locationType: 'CELL', specialistCellTypes: [] })
    res.locals.cells = [cell1, cell2]
    req.sessionModel = mockModel({ 'temp-cellTypescell1': ['TYPE2'], 'saved-cellTypescell2': ['TYPE1'] })
    populateModifiedLocationMap(req as FormWizard.Request, res as Response, next)
    expect(res.locals.modifiedLocationMap.cell1.specialistCellTypes).toEqual(['TYPE2'])
    expect(res.locals.modifiedLocationMap.cell2.specialistCellTypes).toEqual(['TYPE1'])
  })

  it('removes cellTypes if temp/saved removed is set', () => {
    const cell1 = LocationFactory.build({ id: 'cell1', locationType: 'CELL', specialistCellTypes: ['TYPE1'] })
    const cell2 = LocationFactory.build({ id: 'cell2', locationType: 'CELL', specialistCellTypes: ['TYPE2'] })
    res.locals.cells = [cell1, cell2]
    req.sessionModel = mockModel({ 'temp-cellTypescell1-removed': true, 'saved-cellTypescell2-removed': true })
    populateModifiedLocationMap(req as FormWizard.Request, res as Response, next)
    expect(res.locals.modifiedLocationMap.cell1.specialistCellTypes).toEqual([])
    expect(res.locals.modifiedLocationMap.cell2.specialistCellTypes).toEqual([])
  })

  it('returns empty map if no cells present', () => {
    populateModifiedLocationMap(req as FormWizard.Request, res as Response, next)
    expect(res.locals.modifiedLocationMap).toEqual({})
    expect(next).toHaveBeenCalled()
  })
})
