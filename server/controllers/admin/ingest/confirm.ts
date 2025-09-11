import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import {
  BulkCapacityUpdate,
  BulkCapacityUpdateChanges,
  CapacitySummary,
  Change,
} from '../../../data/types/locationsApi/bulkCapacityChanges'
import LocationsService from '../../../services/locationsService'

export default class IngestConfirm extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals.prisonConfiguration

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')
    const capacitySummary: CapacitySummary = req.sessionModel.get('capacitySummary')

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
      capacityData,
      capacitySummary,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')

    const capacityChangeSummary: BulkCapacityUpdateChanges = await processBulkCapacityUpdate(
      systemToken,
      locationsService,
      capacityData,
    )

    req.sessionModel.set('updateMessages', userResponseMessage(capacityChangeSummary))

    return next()
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const result: string = req.sessionModel.get('updateMessages')

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Certification csv ingested',
      content: result,
    })

    res.redirect(`/admin/${prisonId}`)
  }
}

function userResponseMessage(changes: BulkCapacityUpdateChanges): string[] {
  const result: string[] = []

  Object.entries(changes).forEach(([_, changeArray]) => {
    changeArray.forEach(change => {
      result.push(`${change.key} = ${change.message}`)
    })
  })

  // Sort so that ERROR messages come first
  result.sort((a, b) => {
    const aIsError = a.startsWith('ERROR') ? -1 : 1
    const bIsError = b.startsWith('ERROR') ? -1 : 1
    return aIsError - bIsError
  })

  return result
}

export async function processBulkCapacityUpdate(
  systemToken: string,
  locationsService: LocationsService,
  updateData: BulkCapacityUpdate,
): Promise<BulkCapacityUpdateChanges> {
  const groupedData: Record<string, BulkCapacityUpdate> = {}

  // Group data by the wing e.g. EYI-HB1-1-002 would be HB1
  for (const key of Object.keys(updateData)) {
    const parts = key.split('-')
    const groupKey = parts[1]
    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {}
    }
    groupedData[groupKey][key] = updateData[key]
  }

  // Create promises for each group
  const chunkPromises: Promise<BulkCapacityUpdateChanges>[] = Object.entries(groupedData).map(
    async ([_groupKey, chunk]) => {
      try {
        const result = await locationsService.updateBulkCapacity(systemToken, chunk)
        return result
      } catch (error) {
        const key = Object.keys(chunk)[0]
        const wing = key.split('-')[1]

        const { userMessage } = error.data

        const change: Change = {
          key: `ERROR: (complete wing ${wing} not ingested)`,
          message: `${userMessage}`,
        }
        const failedChange = {
          [key]: [change],
        }
        return failedChange
      }
    },
  )

  const allUpdates = await Promise.all(chunkPromises)
  return mergeBulkCapacityUpdateChanges(...allUpdates)
}

export function mergeBulkCapacityUpdateChanges(...updates: BulkCapacityUpdateChanges[]): BulkCapacityUpdateChanges {
  const merged: BulkCapacityUpdateChanges = {}
  for (const update of updates) {
    Object.entries(update).forEach(([key, value]) => {
      merged[key] = value
    })
  }
  return merged
}
