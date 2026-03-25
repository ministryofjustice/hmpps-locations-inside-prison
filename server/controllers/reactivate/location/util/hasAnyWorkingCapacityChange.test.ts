import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import hasAnyWorkingCapacityChange from './hasAnyWorkingCapacityChange'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'

describe('hasAnyWorkingCapacityChange', () => {
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {} as FormWizard.Request
    res = { locals: {} } as Response
  })

  it('returns true if any cell has a working capacity change', () => {
    const cell1 = LocationFactory.build({
      id: 'cell1',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 10 },
    })
    const cell2 = LocationFactory.build({
      id: 'cell2',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 20 },
    })
    res.locals.cells = [cell1, cell2]
    res.locals.modifiedLocationMap = {
      cell1: { ...cell1, oldWorkingCapacity: 10 },
      cell2: { ...cell2, oldWorkingCapacity: 15 },
    }
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(true)
  })

  it('returns false if all cells have unchanged working capacity', () => {
    const cell1 = LocationFactory.build({
      id: 'cell1',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 10 },
    })
    const cell2 = LocationFactory.build({
      id: 'cell2',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 20 },
    })
    res.locals.cells = [cell1, cell2]
    res.locals.modifiedLocationMap = {
      cell1: { ...cell1, oldWorkingCapacity: 10 },
      cell2: { ...cell2, oldWorkingCapacity: 20 },
    }
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(false)
  })

  it('returns true if decoratedCells have a change', () => {
    const decoratedCell = buildDecoratedLocation({
      id: 'cell1',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 5 },
      oldWorkingCapacity: 6,
    })
    res.locals.decoratedCells = [decoratedCell]
    res.locals.modifiedLocationMap = {
      cell1: decoratedCell.raw,
    }
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(true)
  })

  it('returns false if no cells present', () => {
    res.locals.cells = []
    res.locals.modifiedLocationMap = {}
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(false)
  })

  it('returns true if currentCellCertificate is missing and oldWorkingCapacity is not 0', () => {
    const cell1 = LocationFactory.build({
      id: 'cell1',
      locationType: 'CELL',
      oldWorkingCapacity: 1,
      currentCellCertificate: null,
    })
    res.locals.cells = [cell1]
    res.locals.modifiedLocationMap = {
      cell1,
    }
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(true)
  })

  it('returns false if currentCellCertificate is missing and oldWorkingCapacity is 0', () => {
    const cell1 = LocationFactory.build({
      id: 'cell1',
      locationType: 'CELL',
      oldWorkingCapacity: 0,
      currentCellCertificate: null,
    })
    res.locals.cells = [cell1]
    res.locals.modifiedLocationMap = {
      cell1,
    }
    expect(hasAnyWorkingCapacityChange(req, res)).toBe(false)
  })
})
