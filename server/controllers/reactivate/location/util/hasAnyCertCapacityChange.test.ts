import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import LocationFactory from '../../../../testutils/factories/location'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'
import hasAnyCertCapacityChange from './hasAnyCertCapacityChange'

describe('hasAnyCertCapacityChange', () => {
  let req: FormWizard.Request
  let res: Response

  const buildCell = (
    id: string,
    currentCellCertificate: Record<string, unknown> | null,
    overrides: object = {},
  ): any => {
    const cell = LocationFactory.build({ id, locationType: 'CELL', ...overrides })

    if (currentCellCertificate === null) {
      return { ...cell, currentCellCertificate: null }
    }

    return {
      ...cell,
      currentCellCertificate: {
        workingCapacity: cell.oldWorkingCapacity,
        maxCapacity: cell.capacity.maxCapacity,
        certifiedNormalAccommodation: cell.capacity.certifiedNormalAccommodation,
        specialistCellTypes: cell.specialistCellTypes ?? [],
        ...currentCellCertificate,
      },
    }
  }

  const buildMap = (cell: any, overrides: object = {}) => ({
    [cell.id]: {
      ...cell,
      capacity: { ...cell.capacity, ...overrides },
      ...overrides,
    },
  })

  beforeEach(() => {
    req = {} as FormWizard.Request
    res = { locals: {} } as Response
  })

  describe('working capacity', () => {
    it('returns true when working capacity differs from currentCellCertificate', () => {
      const cell = buildCell('cell1', { workingCapacity: 10, certifiedNormalAccommodation: 5, specialistCellTypes: [] })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, { oldWorkingCapacity: 8 })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when working capacity matches currentCellCertificate', () => {
      const cell = buildCell('cell1', { workingCapacity: 10, certifiedNormalAccommodation: 5, specialistCellTypes: [] })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 10,
        maxCapacity: cell.currentCellCertificate.maxCapacity,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })

    it('returns true when currentCellCertificate is absent and working capacity is not 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 3,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when currentCellCertificate is absent and working capacity is 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })
  })

  describe('certified normal accommodation', () => {
    it('returns true when CNA differs from currentCellCertificate', () => {
      const cell = buildCell('cell1', { workingCapacity: 10, certifiedNormalAccommodation: 5, specialistCellTypes: [] })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 10,
        certifiedNormalAccommodation: 99,
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns true when currentCellCertificate is absent and CNA is not 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 4,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when currentCellCertificate is absent and CNA is 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })
  })

  describe('maximum capacity', () => {
    it('returns true when max capacity differs from currentCellCertificate', () => {
      const cell = buildCell('cell1', {
        workingCapacity: 10,
        maxCapacity: 20,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 10,
        maxCapacity: 99,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns true when currentCellCertificate is absent and max capacity is not 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 6,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when currentCellCertificate is absent and max capacity is 0', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })
  })

  describe('specialist cell types', () => {
    it('returns true when specialistCellTypes differ from currentCellCertificate', () => {
      const cell = buildCell('cell1', {
        workingCapacity: 10,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: ['ACCESSIBLE_CELL'],
      })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 10,
        certifiedNormalAccommodation: 5,
        maxCapacity: 20,
        specialistCellTypes: ['LISTENER_CRISIS_CELL'],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when specialistCellTypes match (order-insensitive)', () => {
      const cell = buildCell('cell1', {
        workingCapacity: 10,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: ['ACCESSIBLE_CELL', 'LISTENER_CRISIS_CELL'],
      })
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 10,
        certifiedNormalAccommodation: 5,
        maxCapacity: cell.capacity.maxCapacity,
        specialistCellTypes: ['LISTENER_CRISIS_CELL', 'ACCESSIBLE_CELL'],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })

    it('returns true when currentCellCertificate is absent and specialistCellTypes is non-empty', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: ['ACCESSIBLE_CELL'],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false when currentCellCertificate is absent and specialistCellTypes is empty', () => {
      const cell = buildCell('cell1', null)
      res.locals.cells = [cell]
      res.locals.modifiedLocationMap = buildMap(cell, {
        oldWorkingCapacity: 0,
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
        specialistCellTypes: [],
      })
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })
  })

  describe('multiple cells', () => {
    it('returns true if any cell has a change', () => {
      const cell1 = buildCell('cell1', {
        workingCapacity: 10,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      const cell2 = buildCell('cell2', {
        workingCapacity: 20,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      res.locals.cells = [cell1, cell2]
      res.locals.modifiedLocationMap = {
        ...buildMap(cell1, { oldWorkingCapacity: 10, certifiedNormalAccommodation: 5, specialistCellTypes: [] }),
        ...buildMap(cell2, { oldWorkingCapacity: 15, certifiedNormalAccommodation: 5, specialistCellTypes: [] }),
      }
      expect(hasAnyCertCapacityChange(req, res)).toBe(true)
    })

    it('returns false if all cells are unchanged', () => {
      const cell1 = buildCell('cell1', {
        workingCapacity: 10,
        certifiedNormalAccommodation: 5,
        specialistCellTypes: [],
      })
      const cell2 = buildCell('cell2', {
        workingCapacity: 20,
        certifiedNormalAccommodation: 3,
        specialistCellTypes: [],
      })
      res.locals.cells = [cell1, cell2]
      res.locals.modifiedLocationMap = {
        ...buildMap(cell1, { oldWorkingCapacity: 10, certifiedNormalAccommodation: 5, specialistCellTypes: [] }),
        ...buildMap(cell2, { oldWorkingCapacity: 20, certifiedNormalAccommodation: 3, specialistCellTypes: [] }),
      }
      expect(hasAnyCertCapacityChange(req, res)).toBe(false)
    })
  })

  it('returns false when there are no cells', () => {
    res.locals.cells = []
    res.locals.modifiedLocationMap = {}
    expect(hasAnyCertCapacityChange(req, res)).toBe(false)
  })

  it('falls back to decoratedCells when cells is not set', () => {
    const decoratedCell = buildDecoratedLocation({
      id: 'cell1',
      locationType: 'CELL',
      currentCellCertificate: { workingCapacity: 5, certifiedNormalAccommodation: 3, specialistCellTypes: [] },
      oldWorkingCapacity: 7,
    })
    res.locals.decoratedCells = [decoratedCell]
    res.locals.modifiedLocationMap = {
      cell1: {
        ...decoratedCell.raw,
        oldWorkingCapacity: 7,
        capacity: { ...decoratedCell.raw.capacity, certifiedNormalAccommodation: 3 },
        specialistCellTypes: [],
      },
    }
    expect(hasAnyCertCapacityChange(req, res)).toBe(true)
  })
})
