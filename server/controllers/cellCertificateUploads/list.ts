import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration

  const uploads = await locationsService.getCellCertificateUploads(systemToken, prisonId)
  const hasInProgress = uploads.some(upload => upload.status !== 'FINISHED')

  const locals: TypedLocals = {
    title: 'Cell certificate uploads',
    uploads,
    hasInProgress,
    prisonId,
    listUrl: paths.prison.cellCertificateUploads(prisonId),
    newUploadUrl: `${paths.prison.cellCertificateUploads(prisonId)}/new`,
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

  return res.render('pages/cellCertificateUploads/list', locals)
}
