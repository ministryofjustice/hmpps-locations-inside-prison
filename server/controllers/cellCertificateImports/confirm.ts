import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import FormStep from '../base/formStep'
import { BulkCapacityUpdate, CapacitySummary } from '../../data/types/locationsApi/bulkCapacityChanges'
import paths from '../../utils/paths'

export default class ImportConfirm extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')
    const capacitySummary: CapacitySummary = req.sessionModel.get('capacitySummary')

    return {
      ...locals,
      capacityData,
      capacitySummary,
      buttonText: 'Confirm import',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services
    const { prisonId } = res.locals.prisonConfiguration

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')

    try {
      const certificateImport = await locationsService.requestCellCertificateImport(systemToken, prisonId, capacityData)
      req.sessionModel.set('importId', certificateImport.id)
      return next()
    } catch (error) {
      // 409 = an import is already in progress for this prison; 400 = validation (e.g. reason required)
      const userMessage: string = error.data?.userMessage
      req.sessionModel.set(
        'importError',
        userMessage || 'The cell certificate import could not be started. Try again later.',
      )
      return next()
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const importId: string = req.sessionModel.get('importId')
    const importError: string = req.sessionModel.get('importError')

    req.journeyModel.reset()
    req.sessionModel.reset()

    if (importError) {
      req.flash('error', { title: 'There is a problem', content: importError })
      return res.redirect(paths.prison.cellCertificateImports(prisonId))
    }

    req.flash('success', {
      title: 'Cell certificate import started',
      content: 'The cell certificate is being processed. This page shows its progress.',
    })

    return res.redirect(`${paths.prison.cellCertificateImports(prisonId)}/import/${importId}`)
  }
}
