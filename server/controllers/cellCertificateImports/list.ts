import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration

  const imports = await locationsService.getCellCertificateImports(systemToken, prisonId)
  // Only a running import stops another from starting. A running preview changes nothing, so it does not, but the
  // page still refreshes itself until the preview finishes.
  const hasInProgress = imports.some(
    certificateImport => certificateImport.mode !== 'PREVIEW' && certificateImport.status !== 'FINISHED',
  )
  const autoRefresh = imports.some(certificateImport => certificateImport.status !== 'FINISHED')

  const locals: TypedLocals = {
    title: 'Import cell certificate',
    imports,
    hasInProgress,
    autoRefresh,
    prisonId,
    listUrl: paths.prison.cellCertificateImports(prisonId),
    newImportUrl: `${paths.prison.cellCertificateImports(prisonId)}/new`,
    backLink: paths.prison.home(prisonId),
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = { success: success[0] }
  }

  const errors = req.flash('error')
  if (errors?.length) {
    locals.validationErrors = [{ text: errors[0].content, href: '#' }]
  }

  return res.render('pages/cellCertificateImports/list', locals)
}
