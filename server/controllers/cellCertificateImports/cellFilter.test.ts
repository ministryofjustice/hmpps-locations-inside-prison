import { Request } from 'express'
import {
  applyCellFilter,
  cellFilterView,
  omittedRowTypes,
  parseCellFilter,
  uploadedRowTypes,
  WORKING_CAPACITY_FROM_ZERO_ONLY,
} from './cellFilter'
import { CellCertificateImportLocation } from '../../data/types/locationsApi/cellCertificateImport'

describe('Cell certificate imports - cell filter', () => {
  // A cell arriving from NOMIS: it held a working capacity of 0 and takes the certified value, nothing else changes
  const workingCapacityFromZero = {
    locationKey: 'TST-A-1-001',
    status: 'PROCESSED',
    maxCapacity: 2,
    workingCapacity: 2,
    certifiedNormalAccommodation: 2,
    previousMaxCapacity: 2,
    appliedMaxCapacity: 2,
    previousWorkingCapacity: 0,
    appliedWorkingCapacity: 2,
    previousCertifiedNormalAccommodation: 2,
  } as CellCertificateImportLocation

  describe('uploadedRowTypes', () => {
    it('marks a row whose only change is the working capacity from 0', () => {
      expect(uploadedRowTypes(workingCapacityFromZero, false, [])).toEqual([
        'will-change',
        'working-capacity',
        WORKING_CAPACITY_FROM_ZERO_ONLY,
      ])
    })

    it('still counts it when the certificate records the same move of the working capacity', () => {
      expect(uploadedRowTypes(workingCapacityFromZero, false, ['working capacity'])).toContain(
        WORKING_CAPACITY_FROM_ZERO_ONLY,
      )
    })

    it('does not count it when anything else changes, or the row needs review', () => {
      const withMaxCapacity = { ...workingCapacityFromZero, maxCapacity: 3, appliedMaxCapacity: 3 }
      expect(uploadedRowTypes(withMaxCapacity, false, [])).toEqual(['will-change', 'working-capacity', 'max-capacity'])
      expect(uploadedRowTypes(workingCapacityFromZero, true, [])).not.toContain(WORKING_CAPACITY_FROM_ZERO_ONLY)
      expect(uploadedRowTypes(workingCapacityFromZero, false, ['max capacity'])).not.toContain(
        WORKING_CAPACITY_FROM_ZERO_ONLY,
      )
      expect(uploadedRowTypes(workingCapacityFromZero, false, 'new')).not.toContain(WORKING_CAPACITY_FROM_ZERO_ONLY)
    })

    it('does not count a working capacity that was not 0 before', () => {
      const fromOne = { ...workingCapacityFromZero, previousWorkingCapacity: 1 }
      expect(uploadedRowTypes(fromOne, false, [])).toEqual(['will-change', 'working-capacity'])
    })

    it('takes a value the location could not take as unchanged', () => {
      const keptCna = {
        ...workingCapacityFromZero,
        appliedWorkingCapacity: 0,
        certifiedNormalAccommodation: 1,
        certifiedNormalAccommodationMismatch: true,
      }
      expect(uploadedRowTypes(keptCna, true, [])).toEqual(['will-change', 'needs-review'])
    })

    it('records a change to the cell mark, the sanitation and the certified values', () => {
      const location = {
        ...workingCapacityFromZero,
        appliedWorkingCapacity: 0,
        cellMark: 'A1-NEW',
        previousCellMark: 'A1-01',
        inCellSanitation: true,
        previousInCellSanitation: false,
      }
      expect(uploadedRowTypes(location, false, ['CNA'])).toEqual([
        'will-change',
        'certificate',
        'cell-mark',
        'sanitation',
      ])
      expect(uploadedRowTypes(location, false, 'new')).toContain('certificate')
    })

    it('gives a converted cell no capacity change, whatever the file says', () => {
      const office = { ...workingCapacityFromZero, convertedCellType: 'OFFICE' }
      expect(uploadedRowTypes(office, true, [])).toEqual(['will-change', 'needs-review'])
    })

    it('gives a row that does not change the location only its result', () => {
      expect(uploadedRowTypes({ ...workingCapacityFromZero, status: 'SKIPPED' }, false, [])).toEqual(['no-change'])
      expect(uploadedRowTypes({ ...workingCapacityFromZero, status: 'FAILED' }, false, [])).toEqual(['failed'])
    })
  })

  it('gives a cell not on the file its result', () => {
    expect(omittedRowTypes('ADDED')).toEqual(['added'])
    expect(omittedRowTypes('CARRIED_FORWARD')).toEqual(['carried-forward'])
  })

  describe('parseCellFilter', () => {
    it('reads one type or several, and ignores any it does not know', () => {
      expect(parseCellFilter({ type: 'failed' } as Request['query'])).toEqual({ types: ['failed'], mode: 'show' })
      expect(parseCellFilter({ type: ['added', 'nonsense', 'failed'], mode: 'hide' } as Request['query'])).toEqual({
        types: ['failed', 'added'],
        mode: 'hide',
      })
    })

    it('filters nothing when no type is given', () => {
      expect(parseCellFilter({})).toEqual({ types: [], mode: 'show' })
    })
  })

  describe('applyCellFilter', () => {
    const rows = [
      { locationKey: 'A', types: ['will-change', WORKING_CAPACITY_FROM_ZERO_ONLY] },
      { locationKey: 'B', types: ['will-change', 'max-capacity'] },
      { locationKey: 'C', types: ['failed'] },
    ]
    const keys = (filtered: { locationKey: string }[]) => filtered.map(row => row.locationKey)

    it('shows only the rows with any of the chosen types, in their order', () => {
      expect(keys(applyCellFilter(rows, { mode: 'show', types: ['failed', 'max-capacity'] }))).toEqual(['B', 'C'])
    })

    it('hides the rows with any of the chosen types', () => {
      expect(keys(applyCellFilter(rows, { mode: 'hide', types: [WORKING_CAPACITY_FROM_ZERO_ONLY] }))).toEqual([
        'B',
        'C',
      ])
    })

    it('leaves every row when no type is chosen', () => {
      expect(keys(applyCellFilter(rows, { mode: 'hide', types: [] }))).toEqual(['A', 'B', 'C'])
    })
  })

  describe('cellFilterView', () => {
    const rows = [
      { types: ['will-change', 'working-capacity', WORKING_CAPACITY_FROM_ZERO_ONLY] },
      { types: ['will-change', 'working-capacity', WORKING_CAPACITY_FROM_ZERO_ONLY] },
      { types: ['will-change', 'needs-review'] },
      { types: ['added'] },
    ]

    it('counts the rows of each type, leaving out the types no row has', () => {
      const view = cellFilterView(rows, { mode: 'show', types: [] }, 4, '/TST/imports/import/1', true)

      expect(view.resultItems).toEqual([
        { value: 'will-change', text: 'Will change (3)', hint: undefined, checked: false },
        { value: 'added', text: 'Would be added (1)', hint: undefined, checked: false },
        { value: 'needs-review', text: 'Needs review (1)', hint: undefined, checked: false },
      ])
      expect(view.changeItems.map(item => item.text)).toEqual([
        'Working capacity from 0 only (2)',
        'Working capacity (2)',
      ])
      expect(view.active).toBe(false)
      expect(view.description).toBeUndefined()
    })

    it('uses the import wording when the results are not a preview, and keeps a chosen type no row has', () => {
      const view = cellFilterView(rows, { mode: 'show', types: ['failed'] }, 0, '/url', false)

      expect(view.resultItems.map(item => item.text)).toEqual([
        'Processed (3)',
        'Failed (0)',
        'Added to certificate (1)',
        'Needs review (1)',
      ])
      expect(view.resultItems.find(item => item.value === 'failed')?.checked).toBe(true)
      expect(view.active).toBe(true)
      expect(view.description).toEqual('Showing only cells with: Failed.')
    })

    it('says what a filter that hides cells does', () => {
      const view = cellFilterView(
        rows,
        { mode: 'hide', types: [WORKING_CAPACITY_FROM_ZERO_ONLY, 'added'] },
        1,
        '/url',
        true,
      )

      expect(view.description).toEqual('Hiding cells with: Would be added, Working capacity from 0 only.')
    })

    it('offers the quick views that would show something, linking back to the cells', () => {
      const view = cellFilterView(rows, { mode: 'show', types: [] }, 4, '/url', true)

      expect(view.quickViews).toEqual([
        {
          text: 'Hide cells whose only change is working capacity from 0 (2)',
          href: `/url?mode=hide&type=${WORKING_CAPACITY_FROM_ZERO_ONLY}#cells`,
        },
        {
          text: 'Show only cells that need attention (2)',
          href: '/url?mode=show&type=needs-review&type=failed&type=added#cells',
        },
      ])
      expect(view.clearUrl).toEqual('/url#cells')
    })
  })
})
