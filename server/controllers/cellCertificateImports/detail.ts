import { Request, Response } from 'express'
import { CapacityCell, TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'
import {
  CellCertificateImport,
  CellCertificateImportOmittedLocation,
} from '../../data/types/locationsApi/cellCertificateImport'

/** The result given to a cell that was not in the uploaded file but still went onto the new certificate. */
export const NOT_ON_FILE_STATUS = 'NOT_ON_FILE'

export const NOT_ON_FILE_MESSAGE =
  'Not on the uploaded file. Added to the new cell certificate using the values Residential locations holds.'

export const NOT_ON_FILE_PREVIEW_MESSAGE =
  'Not on the uploaded file. Would be added to the new cell certificate using the values Residential locations holds.'

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

// Cells that had no row in the upload still went onto the certificate at the values the location holds. They are
// shown as rows alongside the uploaded cells, with those values, so the person reviewing can judge whether they
// should have been certified. There is no before and after for them, so each column shows the single value. The
// key links to the location, which is why the API returns its id.
export const notOnCertificateLocationRows = (
  locationsNotOnCertificate: CellCertificateImportOmittedLocation[] | undefined,
  prisonId?: string,
  preview = false,
) =>
  (locationsNotOnCertificate || []).map(location => ({
    locationKey: location.locationKey,
    url: prisonId && location.locationId ? paths.location.view(prisonId, location.locationId) : undefined,
    status: NOT_ON_FILE_STATUS,
    message: preview ? NOT_ON_FILE_PREVIEW_MESSAGE : NOT_ON_FILE_MESSAGE,
    needsReview: false,
    maxCapacity: heldAndCertifiedCell(location.maxCapacity, undefined),
    workingCapacity: heldAndCertifiedCell(location.workingCapacity, undefined),
    certifiedNormalAccommodation: heldAndCertifiedCell(location.certifiedNormalAccommodation, undefined),
  }))

// Cells needing review first, then cells added from outside the file, then the rest. Array sort is stable, so each
// group keeps the location order the API returned.
const rowOrder = (row: { needsReview: boolean; status: string }) => {
  if (row.needsReview) return 0
  if (row.status === NOT_ON_FILE_STATUS) return 1
  return 2
}

// A preview compares the prison's current certificate with the one the import would create. A prison may have no
// certificate yet, in which case there is nothing on the current side.
export const certificateTotalsRows = (certificateImport: CellCertificateImport) => {
  const current = certificateImport.currentCertificateTotals
  const projected = certificateImport.projectedCertificateTotals
  if (!projected) return []

  const row = (label: string, key: 'maxCapacity' | 'workingCapacity' | 'certifiedNormalAccommodation') => ({
    label,
    current: current ? String(current[key]) : '-',
    afterImport: String(projected[key]),
    changed: !current || current[key] !== projected[key],
  })

  return [
    row('Max capacity', 'maxCapacity'),
    row('Working capacity', 'workingCapacity'),
    row('CNA', 'certifiedNormalAccommodation'),
  ]
}

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonId } = res.locals.prisonConfiguration
  const importId = req.params.importId as string

  const certificateImport = await locationsService.getCellCertificateImport(systemToken, importId)
  const inProgress = certificateImport.status !== 'FINISHED'
  const isPreview = certificateImport.mode === 'PREVIEW'
  const listUrl = paths.prison.cellCertificateImports(prisonId)

  const uploadedRows = (certificateImport.locations || []).map(location => ({
    locationKey: location.locationKey,
    status: location.status,
    message: location.message,
    needsReview: Boolean(
      location.workingCapacityMismatch || location.maxCapacityMismatch || location.certifiedNormalAccommodationMismatch,
    ),
    maxCapacity: maxCapacityCell(location),
    workingCapacity: workingCapacityCell(location),
    certifiedNormalAccommodation: capacityCell(
      location.previousCertifiedNormalAccommodation,
      location.certifiedNormalAccommodation,
      location.certifiedNormalAccommodationMismatch,
    ),
  }))

  // The cells needing review are the point of the report, so they come first, followed by the cells the upload
  // did not include but the certificate now does.
  const locationRows = [
    ...uploadedRows,
    ...notOnCertificateLocationRows(certificateImport.locationsNotOnCertificate, prisonId, isPreview),
  ].sort((a, b) => rowOrder(a) - rowOrder(b))

  const locals: TypedLocals = {
    title: isPreview ? 'Preview of cell certificate import' : 'Cell certificate import',
    certificateImport,
    locationRows,
    inProgress,
    isPreview,
    certificateTotalsRows: isPreview ? certificateTotalsRows(certificateImport) : [],
    // A finished preview can be continued once; after that it links to the import it became
    continueUrl:
      isPreview && !inProgress && !certificateImport.continuedAsUploadId
        ? `${listUrl}/import/${certificateImport.id}/continue`
        : undefined,
    continuedImportUrl:
      isPreview && certificateImport.continuedAsUploadId
        ? `${listUrl}/import/${certificateImport.continuedAsUploadId}`
        : undefined,
    listUrl,
    backLink: listUrl,
    cellCertificateUrl:
      certificateImport.status === 'FINISHED' && certificateImport.cellCertificateId
        ? paths.cellCertificate.view(prisonId, certificateImport.cellCertificateId)
        : undefined,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = { success: success[0] }
  }

  const errors = req.flash('error')
  if (errors?.length) {
    locals.validationErrors = [{ text: errors[0].content, href: '#' }]
  }

  return res.render('pages/cellCertificateImports/detail', locals)
}
