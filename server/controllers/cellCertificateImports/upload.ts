import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import fs from 'fs'
import { TypedLocals } from '../../@types/express'
import FormStep from '../base/formStep'
import { BulkCapacityUpdate, CapacitySummary } from '../../data/types/locationsApi/bulkCapacityChanges'

export default class ImportUpload extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    return {
      ...locals,
      buttonText: 'Upload',
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { prisonId } = res.locals.prisonConfiguration
      const uploadedFile = req.file as Express.Multer.File

      const validationErrors: FormWizard.Errors = {}

      if (!uploadedFile) {
        validationErrors.file = this.formError('file', 'required')
      } else {
        try {
          const csvText = readCsvFile(uploadedFile.path)
          const capacityData = parseCsvRow(csvText)

          if (Object.keys(capacityData).length === 0) {
            validationErrors.file = this.formError('file', 'noData')
          }

          if (invalidDataForPrison(prisonId, capacityData)) {
            validationErrors.file = this.formError('file', 'invalidPrison')
          }
        } catch (error) {
          validationErrors.file =
            error instanceof Error && isCsvValidationError(error.message)
              ? this.formError('file', 'importFailure', error.message)
              : this.formError('file', 'parseFailure')
        }
      }
      callback({ ...errors, ...validationErrors })
    })
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const uploadedFile: Express.Multer.File = req.file as Express.Multer.File

    try {
      const csvText = readCsvFile(uploadedFile.path)
      const capacityData: BulkCapacityUpdate = parseCsvRow(csvText)
      const capacitySummary: CapacitySummary = summarizeCapacityByWing(capacityData)

      req.sessionModel.set('capacityData', capacityData)
      req.sessionModel.set('capacitySummary', capacitySummary)
    } catch (error) {
      next(error)
      return
    }

    next()
  }
}

export function readCsvFile(path: string): string[] {
  const data = fs.readFileSync(path, 'utf8')
  return data
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(1) // Skip header
}

/** How many cells to name before falling back to a count of the rest. */
const MAX_CELLS_LISTED = 5

/**
 * One problem found on one row. The cell is held separately from the wording so that rows failing in the
 * same way can be reported together - a spreadsheet is typically wrong in the same way many times over.
 */
type RowValidationError = { before: string; cell: string; after?: string }

export function parseCsvRow(rows: string[]): BulkCapacityUpdate {
  const validationErrors: RowValidationError[] = []
  const capacityData = rows.reduce<BulkCapacityUpdate>((acc, row, index) => {
    const [
      ,
      // wing (ignored)
      cellNumber,
      cellMark,
      certifiedNormalAccommodation,
      maxCapacity,
      workingCapacity,
      ,
      // usedFor (ignored)
      inCellSanitation,
    ] = row.split(',')

    const rowNumber = index + 2 // account for the CSV header row
    const cellNumberValue = cellNumber ?? ''
    const sanitation = ['true', 'false'].includes(inCellSanitation?.toLowerCase())
      ? inCellSanitation.toLowerCase() === 'true'
      : undefined

    const maxCapacityError = getNumericValidationError(maxCapacity, 'Max Cap', cellNumberValue)
    const workingCapacityError = getNumericValidationError(workingCapacity, 'Working Cap', cellNumberValue)
    const cnaError = getNumericValidationError(certifiedNormalAccommodation, 'CNA', cellNumberValue)
    const cellMarkError = getCellMarkValidationError(cellMark, cellNumberValue, rowNumber)
    // only worth comparing once both values are known to be numbers
    const capacityError =
      maxCapacityError || workingCapacityError
        ? undefined
        : getCapacityValidationError(workingCapacity, maxCapacity, cellNumberValue)

    if (maxCapacityError) validationErrors.push(maxCapacityError)
    if (workingCapacityError) validationErrors.push(workingCapacityError)
    if (cnaError) validationErrors.push(cnaError)
    if (cellMarkError) validationErrors.push(cellMarkError)
    if (capacityError) validationErrors.push(capacityError)

    if (maxCapacityError || workingCapacityError || cnaError || cellMarkError || capacityError) {
      return acc
    }

    acc[cellNumberValue] = {
      // sent as uploaded: the certificate must record what the prison stated. A location cannot hold a max
      // capacity of zero, so the API raises the value it writes onto the location itself.
      maxCapacity: parseInt(maxCapacity, 10),
      workingCapacity: parseInt(workingCapacity, 10),
      certifiedNormalAccommodation: parseInt(certifiedNormalAccommodation, 10),
      cellMark,
      inCellSanitation: sanitation,
    }

    return acc
  }, {})

  if (validationErrors.length) {
    throw new Error(summariseValidationErrors(validationErrors))
  }

  return capacityData
}

/**
 * Turns the per-row problems into a message a user can act on. The error summary renders as plain text, so
 * newlines would collapse into one run-on line - and 88 near-identical lines would not help anyone anyway.
 * Rows that failed in the same way are reported once, naming the first few cells and counting the rest.
 */
function summariseValidationErrors(errors: RowValidationError[]): string {
  const groups = new Map<string, { error: RowValidationError; cells: string[] }>()

  errors.forEach(error => {
    const key = `${error.before}|${error.after ?? ''}`
    const group = groups.get(key) ?? { error, cells: [] }
    group.cells.push(error.cell)
    groups.set(key, group)
  })

  return [...groups.values()]
    .map(({ error, cells }) => [`${error.before} ${listCells(cells)}.`, error.after].filter(Boolean).join(' '))
    .join(' ')
}

function listCells(cells: string[]): string {
  const shown = cells.slice(0, MAX_CELLS_LISTED)
  const remaining = cells.length - shown.length

  if (remaining === 0) {
    return shown.length === 1 ? `cell ${shown[0]}` : `cells ${shown.join(', ')}`
  }

  return `cells ${shown.join(', ')} and ${remaining} ${remaining === 1 ? 'other' : 'others'}`
}

// A cell cannot be certified to hold more prisoners than its max capacity allows, and the API rejects the
// whole upload for it - so catch it here, where the message can name the cells and the columns to check.
function getCapacityValidationError(
  workingCapacity: string,
  maxCapacity: string,
  cellNumber: string,
): RowValidationError | undefined {
  if (Number(workingCapacity) > Number(maxCapacity)) {
    return {
      before: 'The Working Cap value is more than the Max Cap value for',
      cell: cellNumber,
      after:
        'A cell cannot be certified to hold more people than its maximum capacity, so check the ' +
        '"Maximum number of prisoners" and "Number of places allocated" columns.',
    }
  }

  return undefined
}

function getNumericValidationError(
  value: string | undefined,
  type: string,
  cellNumber: string,
): RowValidationError | undefined {
  if (value === undefined || value.trim() === '' || Number.isNaN(Number(value))) {
    return { before: `The ${type} value is not numeric for`, cell: cellNumber }
  }

  return undefined
}

function getCellMarkValidationError(
  value: string | undefined,
  cellNumber: string,
  rowNumber: number,
): RowValidationError | undefined {
  const cellMark = value?.trim()

  if (!cellMark) {
    return undefined
  }

  if (looksLikeDate(cellMark)) {
    return {
      before: `Row ${rowNumber}: the Number or cell mark value "${cellMark}" looks like a date for`,
      cell: cellNumber,
    }
  }

  return undefined
}

function looksLikeDate(value: string) {
  const monthNames = '(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)'
  const monthNameDate = new RegExp(`^\\d{1,2}[-/ ]${monthNames}$|^${monthNames}[-/ ]\\d{1,2}$`, 'i')
  const numericDate = /^\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?$/

  return monthNameDate.test(value) || numericDate.test(value)
}

function isCsvValidationError(message: string) {
  return message.startsWith('The ') || message.startsWith('Row ')
}

export function invalidDataForPrison(prisonId: string, data: BulkCapacityUpdate): boolean {
  return Object.keys(data).some(key => key.substring(0, 3) !== prisonId)
}

export function summarizeCapacityByWing(data: BulkCapacityUpdate): CapacitySummary {
  const summary: CapacitySummary = {}

  Object.entries(data).forEach(([key, value]) => {
    const parts = key.split('-')
    const wing = parts.length >= 2 ? parts[1] : 'UNKNOWN'

    if (!summary[wing]) {
      summary[wing] = {
        maxCapacity: 0,
        workingCapacity: 0,
        certifiedNormalAccommodation: 0,
      }
    }

    summary[wing].maxCapacity += value.maxCapacity
    summary[wing].workingCapacity += value.workingCapacity
    summary[wing].certifiedNormalAccommodation += value.certifiedNormalAccommodation
  })
  return summary
}
