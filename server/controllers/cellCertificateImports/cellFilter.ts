import { Request } from 'express'
import { CellCertificateImportLocation } from '../../data/types/locationsApi/cellCertificateImport'

/**
 * Filtering the cells on an import's results (MAPA-457). Most rows in a prison's first import only set the working
 * capacity from 0 to the certified value, because NOMIS holds 0 at cell level, and they bury the few rows that need a
 * decision. Each row is given the types it has - its result, and what about the cell changes - and the table can show
 * only, or hide, the rows with any of the chosen types. Rows stay in the order of the file either way.
 */
export type CellFilterMode = 'show' | 'hide'

export interface CellFilter {
  types: string[]
  mode: CellFilterMode
}

interface CellType {
  value: string
  group: 'result' | 'change'
  text: string
  previewText?: string
  hint?: string
}

export const WORKING_CAPACITY_FROM_ZERO_ONLY = 'working-capacity-from-zero-only'

export const CELL_TYPES: CellType[] = [
  { value: 'will-change', group: 'result', text: 'Processed', previewText: 'Will change' },
  { value: 'no-change', group: 'result', text: 'Skipped', previewText: 'No change' },
  { value: 'failed', group: 'result', text: 'Failed', previewText: 'Will fail' },
  { value: 'added', group: 'result', text: 'Added to certificate', previewText: 'Would be added' },
  { value: 'carried-forward', group: 'result', text: 'Carried forward', previewText: 'Would be carried forward' },
  { value: 'needs-review', group: 'result', text: 'Needs review' },
  {
    value: WORKING_CAPACITY_FROM_ZERO_ONLY,
    group: 'change',
    text: 'Working capacity from 0 only',
    hint: 'The cell held a working capacity of 0 and takes the certified value. Nothing else about it changes.',
  },
  { value: 'working-capacity', group: 'change', text: 'Working capacity' },
  { value: 'max-capacity', group: 'change', text: 'Max capacity' },
  { value: 'cna', group: 'change', text: 'CNA' },
  { value: 'cell-mark', group: 'change', text: 'Cell mark' },
  { value: 'sanitation', group: 'change', text: 'In-cell sanitation' },
  {
    value: 'certificate',
    group: 'change',
    text: 'Certified values',
    hint: 'The values on the certificate change, or the cell is new to the certificate.',
  },
]

const RESULT_TYPES: Record<string, string> = {
  PROCESSED: 'will-change',
  SKIPPED: 'no-change',
  FAILED: 'failed',
  ADDED: 'added',
  CARRIED_FORWARD: 'carried-forward',
}

// The quick views answer the questions the central team asks of a long import: what can be passed over, what needs
// someone to look at it, and what is left alone.
const QUICK_VIEWS: { text: string; filter: CellFilter }[] = [
  {
    text: 'Hide cells whose only change is working capacity from 0',
    filter: { mode: 'hide', types: [WORKING_CAPACITY_FROM_ZERO_ONLY] },
  },
  { text: 'Show only cells that need attention', filter: { mode: 'show', types: ['needs-review', 'failed', 'added'] } },
  { text: 'Show only cells with no change', filter: { mode: 'show', types: ['no-change', 'carried-forward'] } },
]

const isSet = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null

const changed = (before: number | undefined, after: number | undefined) =>
  isSet(before) && isSet(after) && before !== after

/**
 * The types of a row from the file. What the location ends up holding is worked out as the capacity columns do: an
 * uploaded value the location could not take leaves it at its own. A converted cell takes no capacity, whatever the
 * file says. [certifiedFieldsChanged] lists the certificate values that change for the cell, or is 'new' when the cell
 * is new to the certificate.
 */
export const uploadedRowTypes = (
  location: CellCertificateImportLocation,
  needsReview: boolean,
  certifiedFieldsChanged: string[] | 'new',
): string[] => {
  const types = [RESULT_TYPES[location.status]].filter(Boolean)
  if (needsReview) types.push('needs-review')
  if (certifiedFieldsChanged === 'new' || certifiedFieldsChanged.length) types.push('certificate')
  if (location.status !== 'PROCESSED') return types

  const changes: string[] = []
  if (!location.convertedCellType) {
    const appliedMax =
      location.appliedMaxCapacity ??
      (location.maxCapacityMismatch ? location.previousMaxCapacity : location.maxCapacity)
    const appliedWorking = location.appliedWorkingCapacity ?? location.previousWorkingCapacity
    const appliedCna = location.certifiedNormalAccommodationMismatch
      ? location.previousCertifiedNormalAccommodation
      : (location.certifiedNormalAccommodation ?? location.previousCertifiedNormalAccommodation)

    if (changed(location.previousWorkingCapacity, appliedWorking)) changes.push('working-capacity')
    if (changed(location.previousMaxCapacity, appliedMax)) changes.push('max-capacity')
    if (changed(location.previousCertifiedNormalAccommodation, appliedCna)) changes.push('cna')
  }
  if (location.cellMark && location.cellMark !== location.previousCellMark) changes.push('cell-mark')
  if (isSet(location.inCellSanitation) && location.inCellSanitation !== location.previousInCellSanitation) {
    changes.push('sanitation')
  }

  // The certificate may record the same move of the working capacity, which is no more of a change
  const onlyWorkingCapacityFromZero =
    changes.length === 1 &&
    changes[0] === 'working-capacity' &&
    location.previousWorkingCapacity === 0 &&
    !needsReview &&
    certifiedFieldsChanged !== 'new' &&
    certifiedFieldsChanged.every(field => field === 'working capacity')

  return [...types, ...changes, ...(onlyWorkingCapacityFromZero ? [WORKING_CAPACITY_FROM_ZERO_ONLY] : [])]
}

/** A cell not on the file is either added to the certificate or carried forward; nothing else about it changes. */
export const omittedRowTypes = (status: string): string[] => [RESULT_TYPES[status]].filter(Boolean)

export const parseCellFilter = (query: Request['query']): CellFilter => {
  const requested = [query.type].flat().filter((value): value is string => typeof value === 'string')
  return {
    types: CELL_TYPES.map(type => type.value).filter(value => requested.includes(value)),
    mode: query.mode === 'hide' ? 'hide' : 'show',
  }
}

export const applyCellFilter = <T extends { types: string[] }>(rows: T[], filter: CellFilter): T[] => {
  if (!filter.types.length) return rows
  const matches = (row: T) => row.types.some(type => filter.types.includes(type))
  return rows.filter(row => (filter.mode === 'show' ? matches(row) : !matches(row)))
}

const filterQuery = (filter: CellFilter) =>
  new URLSearchParams([
    ['mode', filter.mode],
    ...filter.types.map((type): [string, string] => ['type', type]),
  ]).toString()

/**
 * What the page needs to draw the filter: each type with how many rows have it (types no row has are left out unless
 * chosen), the quick views that would show anything, how many rows are showing and a line saying what the filter does.
 */
export const cellFilterView = (
  rows: { types: string[] }[],
  filter: CellFilter,
  shownRows: number,
  pageUrl: string,
  preview: boolean,
) => {
  const count = (types: string[]) => rows.filter(row => row.types.some(type => types.includes(type))).length
  const label = (type: CellType) => (preview && type.previewText) || type.text
  const chosen = CELL_TYPES.filter(type => filter.types.includes(type.value)).map(label)
  const items = (group: CellType['group']) =>
    CELL_TYPES.filter(type => type.group === group)
      .map(type => ({ type, rows: count([type.value]), checked: filter.types.includes(type.value) }))
      .filter(item => item.rows || item.checked)
      .map(({ type, rows: typeRows, checked }) => ({
        value: type.value,
        text: `${label(type)} (${typeRows})`,
        hint: type.hint ? { text: type.hint } : undefined,
        checked,
      }))

  return {
    active: filter.types.length > 0,
    mode: filter.mode,
    resultItems: items('result'),
    changeItems: items('change'),
    quickViews: QUICK_VIEWS.map(view => ({
      text: `${view.text} (${count(view.filter.types)})`,
      href: `${pageUrl}?${filterQuery(view.filter)}#cells`,
      available: count(view.filter.types) > 0,
    }))
      .filter(view => view.available)
      .map(({ text, href }) => ({ text, href })),
    description: chosen.length
      ? `${filter.mode === 'show' ? 'Showing only cells with' : 'Hiding cells with'}: ${chosen.join(', ')}.`
      : undefined,
    shownRows,
    totalRows: rows.length,
    clearUrl: `${pageUrl}#cells`,
  }
}
