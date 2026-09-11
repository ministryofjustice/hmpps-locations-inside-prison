import { Request, Response } from 'express'
import { CapacityCell, TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

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

// Shows what the location holds, with the certified value beneath it when the two differ.
export const heldAndCertifiedCell = (held: number | undefined, certified: number | undefined): CapacityCell => {
  const text = held === undefined || held === null ? '-' : String(held)
  if (certified === undefined || certified === null || certified === held) return { text }
  return { text, certifiedText: String(certified) }
}

// The location's max capacity can differ from the certified one even when the upload was applied, because a
// location cannot hold a max capacity of zero and the API raises it to one. Uploads processed before that
// value was recorded fall back to inferring it from the mismatch flag.
export const maxCapacityCell = (location: {
  previousMaxCapacity?: number
  maxCapacity?: number
  appliedMaxCapacity?: number
  maxCapacityMismatch?: boolean
}): CapacityCell => {
  const applied =
    location.appliedMaxCapacity ?? (location.maxCapacityMismatch ? location.previousMaxCapacity : location.maxCapacity)

  return appliedCapacityCell(location.previousMaxCapacity, location.maxCapacity, applied)
}

// An import only moves a working capacity the location has never held (a cell arriving from NOMIS holds 0),
// so the column normally shows the held value with the certified one beneath - but where the location did
// take the certified value it must show the change. Uploads processed before the applied value was recorded
// are treated as having kept their own: the mismatch flag cannot tell the two apart for them, and a change
// that never happened is the worse thing to show.
export const workingCapacityCell = (location: {
  previousWorkingCapacity?: number
  workingCapacity?: number
  appliedWorkingCapacity?: number
}): CapacityCell => {
  const applied = location.appliedWorkingCapacity ?? location.previousWorkingCapacity

  return appliedCapacityCell(location.previousWorkingCapacity, location.workingCapacity, applied)
}

// The change the location took, with the certified value beneath it where the location ended up elsewhere.
const appliedCapacityCell = (
  previous: number | undefined,
  certified: number | undefined,
  applied: number | undefined,
): CapacityCell => ({
  ...heldAndCertifiedCell(applied, certified),
  text: changeText(previous, applied),
})

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration
  const importId = req.params.importId as string

  const certificateImport = await locationsService.getCellCertificateImport(systemToken, importId)
  const inProgress = certificateImport.status !== 'FINISHED'

  const locationRows = (certificateImport.locations || [])
    .map(location => ({
      locationKey: location.locationKey,
      status: location.status,
      message: location.message,
      needsReview: Boolean(
        location.workingCapacityMismatch ||
        location.maxCapacityMismatch ||
        location.certifiedNormalAccommodationMismatch,
      ),
      maxCapacity: maxCapacityCell(location),
      workingCapacity: workingCapacityCell(location),
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
    title: 'Cell certificate import',
    certificateImport,
    locationRows,
    inProgress,
    listUrl: paths.prison.cellCertificateImports(prisonId),
    backLink: paths.prison.cellCertificateImports(prisonId),
    cellCertificateUrl:
      certificateImport.status === 'FINISHED' && certificateImport.cellCertificateId
        ? paths.cellCertificate.view(prisonId, certificateImport.cellCertificateId)
        : undefined,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = { success: success[0] }
  }

  return res.render('pages/cellCertificateImports/detail', locals)
}
