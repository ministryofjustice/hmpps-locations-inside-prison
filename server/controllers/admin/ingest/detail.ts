import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'

// Renders a "before -> after" string, handling 0 (a valid capacity) and missing previous values.
export const changeText = (previous: number | undefined, current: number | undefined): string => {
  if (current === undefined || current === null) return '-'
  if (previous === undefined || previous === null || previous === current) return String(current)
  return `${previous} → ${current}`
}

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration
  const uploadId = req.params.uploadId as string

  const upload = await locationsService.getCellCertificateUpload(systemToken, uploadId)
  const inProgress = upload.status !== 'FINISHED'

  const locationRows = (upload.locations || []).map(location => ({
    locationKey: location.locationKey,
    status: location.status,
    message: location.message,
    maxCapacityText: changeText(location.previousMaxCapacity, location.maxCapacity),
    workingCapacityText: changeText(location.previousWorkingCapacity, location.workingCapacity),
    certifiedNormalAccommodationText: changeText(
      location.previousCertifiedNormalAccommodation,
      location.certifiedNormalAccommodation,
    ),
  }))

  const locals: TypedLocals = {
    title: 'Cell certificate upload',
    upload,
    locationRows,
    inProgress,
    listUrl: `/admin/${prisonId}/ingest-cert`,
    backLink: `/admin/${prisonId}/ingest-cert`,
    cellCertificateUrl:
      upload.status === 'FINISHED' && upload.cellCertificateId
        ? `/${prisonId}/cell-certificate/${upload.cellCertificateId}`
        : undefined,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = { success: success[0] }
  }

  return res.render('pages/admin/ingest/detail', locals)
}
