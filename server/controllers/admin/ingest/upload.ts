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
      fallbackUrl: `/admin/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
      title: 'Upload cell cert data',
      buttonText: 'Upload',
      cancelText: 'Cancel and return to prison configuration details',
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
          validationErrors.file = error.message.includes('numeric')
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
  return Object.fromEntries(
    rows.map(row => {
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

      const sanitation = ['true', 'false'].includes(inCellSanitation?.toLowerCase())
        ? inCellSanitation.toLowerCase() === 'true'
        : undefined

      assertIsValidNumber(maxCapacity, 'Max Cap', cellNumber)
      assertIsValidNumber(certifiedNormalAccommodation, 'CNA', cellNumber)

      return [
        cellNumber,
        {
          maxCapacity: parseInt(maxCapacity, 10) === 0 ? 1 : parseInt(maxCapacity, 10),
          workingCapacity: parseInt(workingCapacity, 10) ? parseInt(workingCapacity, 10) : 0,
          certifiedNormalAccommodation: parseInt(certifiedNormalAccommodation, 10),
          cellMark,
          inCellSanitation: sanitation,
        },
      ]
    }),
  )
}

function assertIsValidNumber(value: string, type: string, cellNumber: string) {
  if (value === undefined || value.trim() === '' || Number.isNaN(Number(value))) {
    throw new Error(`The ${type} value is not numeric for cell ${cellNumber}`)
  }
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
