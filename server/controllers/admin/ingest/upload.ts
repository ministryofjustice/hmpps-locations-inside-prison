import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import fs from 'fs'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { BulkCapacityUpdate, CapacitySummary } from '../../../data/types/locationsApi/bulkCapacityChanges'

export default class IngestUpload extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals.prisonConfiguration

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}/ingest-cert`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
      title: 'Upload cell cert data',
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
              ? this.formError('file', 'ingest', error.message)
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
      return next()
    } catch (error) {
      return next(error)
    }

    return next()
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

export function parseCsvRow(rows: string[]): BulkCapacityUpdate {
  const validationErrors: string[] = []
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
    const cnaError = getNumericValidationError(certifiedNormalAccommodation, 'CNA', cellNumberValue)
    const cellMarkError = getCellMarkValidationError(cellMark, cellNumberValue, rowNumber)

    if (maxCapacityError) validationErrors.push(maxCapacityError)
    if (cnaError) validationErrors.push(cnaError)
    if (cellMarkError) validationErrors.push(cellMarkError)

    if (maxCapacityError || cnaError || cellMarkError) {
      return acc
    }

    acc[cellNumberValue] = {
      maxCapacity: parseInt(maxCapacity, 10) === 0 ? 1 : parseInt(maxCapacity, 10),
      workingCapacity: parseInt(workingCapacity, 10) ? parseInt(workingCapacity, 10) : 0,
      certifiedNormalAccommodation: parseInt(certifiedNormalAccommodation, 10),
      cellMark,
      inCellSanitation: sanitation,
    }

    return acc
  }, {})

  if (validationErrors.length) {
    throw new Error(validationErrors.join('\n'))
  }

  return capacityData
}

function getNumericValidationError(value: string | undefined, type: string, cellNumber: string) {
  if (value === undefined || value.trim() === '' || Number.isNaN(Number(value))) {
    return `The ${type} value is not numeric for cell ${cellNumber}`
  }

  return undefined
}

function getCellMarkValidationError(value: string | undefined, cellNumber: string, rowNumber: number) {
  const cellMark = value?.trim()

  if (!cellMark) {
    return undefined
  }

  if (looksLikeDate(cellMark)) {
    return `Row ${rowNumber}: the Number or cell mark value "${cellMark}" looks like a date for cell ${cellNumber}`
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
