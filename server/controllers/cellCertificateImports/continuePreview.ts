import { Request, Response } from 'express'
import paths from '../../utils/paths'

/**
 * Continues a finished preview as a real import. The API copies the preview's rows into a new import and works
 * everything out again against the locations as they are now, so the user is taken to the new import's report.
 * If the preview cannot be continued - it is out of date, already continued, or another import is running - the
 * user stays on the preview and is told why.
 */
export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration
  const previewId = req.params.importId as string
  const listUrl = paths.prison.cellCertificateImports(prisonId)

  try {
    const certificateImport = await locationsService.continueCellCertificatePreview(systemToken, previewId)

    req.flash('success', {
      title: 'Cell certificate import started',
      content: 'Residential locations and the cell certificate are being updated. This page shows its progress.',
    })
    return res.redirect(`${listUrl}/import/${certificateImport.id}`)
  } catch (error) {
    req.flash('error', {
      title: 'There is a problem',
      content: error.data?.userMessage || 'The import could not be started. Try again later.',
    })
    return res.redirect(`${listUrl}/import/${previewId}`)
  }
}
