import { Request, Response } from 'express'
import { CapacityCell, TypedLocals } from '../../../@types/express'
import paths from '../../../utils/paths'

// Renders a "before -> after" string, handling 0 (a valid capacity) and missing previous values.
export const changeText = (previous: number | undefined, current: number | undefined): string => {
  if (current === undefined || current === null) return '-'
  if (previous === undefined || previous === null || previous === current) return String(current)
  return `${previous} → ${current}`
}

// Where the uploaded value could not be applied, the location kept the value it already had, so the "before"
// is what it still holds and the uploaded value is what the certificate now records.
export const capacityCell = (
  previous: number | undefined,
  uploaded: number | undefined,
  mismatch: boolean | undefined,
): CapacityCell => {
  if (!mismatch) return { text: changeText(previous, uploaded) }
  return {
    text: previous === undefined || previous === null ? '-' : String(previous),
    certifiedText: uploaded === undefined || uploaded === null ? '-' : String(uploaded),
  }
}

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration
  const uploadId = req.params.uploadId as string

  const upload = await locationsService.getCellCertificateUpload(systemToken, uploadId)
  const inProgress = upload.status !== 'FINISHED'

  const locationRows = (upload.locations || [])
    .map(location => ({
      locationKey: location.locationKey,
      status: location.status,
      message: location.message,
      needsReview: Boolean(
        location.workingCapacityMismatch ||
        location.maxCapacityMismatch ||
        location.certifiedNormalAccommodationMismatch,
      ),
      maxCapacity: capacityCell(location.previousMaxCapacity, location.maxCapacity, location.maxCapacityMismatch),
      workingCapacity: capacityCell(
        location.previousWorkingCapacity,
        location.workingCapacity,
        location.workingCapacityMismatch,
      ),
      certifiedNormalAccommodation: capacityCell(
        location.previousCertifiedNormalAccommodation,
        location.certifiedNormalAccommodation,
        location.certifiedNormalAccommodationMismatch,
      ),
    }))
    // The cells needing review are the point of the report, so lift them above the rest. Array sort is stable,
    // so everything else keeps the location order the API returned.
    .sort((a, b) => Number(b.needsReview) - Number(a.needsReview))

  const locals: TypedLocals = {
    title: 'Cell certificate upload',
    upload,
    locationRows,
    inProgress,
    listUrl: paths.admin.ingestCert(prisonId),
    backLink: paths.admin.ingestCert(prisonId),
    cellCertificateUrl:
      upload.status === 'FINISHED' && upload.cellCertificateId
        ? paths.cellCertificate.view(prisonId, upload.cellCertificateId)
        : undefined,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = { success: success[0] }
  }

  return res.render('pages/admin/ingest/detail', locals)
}
