import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { BulkCapacityUpdate, CapacitySummary } from '../../../data/types/locationsApi/bulkCapacityChanges'

export default class IngestConfirm extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals.prisonConfiguration

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')
    const capacitySummary: CapacitySummary = req.sessionModel.get('capacitySummary')

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}/ingest-cert`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
      capacityData,
      capacitySummary,
      title: 'Confirm cell certification ingest',
      buttonText: 'Confirm ingestion',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services
    const { prisonId } = res.locals.prisonConfiguration

    const capacityData: BulkCapacityUpdate = req.sessionModel.get('capacityData')

    try {
      const upload = await locationsService.requestCellCertificateUpload(systemToken, prisonId, capacityData)
      req.sessionModel.set('uploadId', upload.id)
      return next()
    } catch (error) {
      // 409 = an upload is already in progress for this prison; 400 = validation (e.g. reason required)
      const userMessage: string = error.data?.userMessage
      req.sessionModel.set(
        'ingestError',
        userMessage || 'The cell certificate upload could not be started. Try again later.',
      )
      return next()
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const uploadId: string = req.sessionModel.get('uploadId')
    const ingestError: string = req.sessionModel.get('ingestError')

    req.journeyModel.reset()
    req.sessionModel.reset()

    if (ingestError) {
      req.flash('error', { title: 'There is a problem', content: ingestError })
      return res.redirect(`/admin/${prisonId}/ingest-cert`)
    }

    req.flash('success', {
      title: 'Cell certificate upload started',
      content: 'The cell certificate is being processed. This page shows its progress.',
    })

    return res.redirect(`/admin/${prisonId}/ingest-cert/upload/${uploadId}`)
  }
}
