import { Request, Response } from 'express'
import { CapacityCell, TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'
import {
  CellCertificateImport,
  CellCertificateImportLocation,
  CellCertificateImportOmittedLocation,
} from '../../data/types/locationsApi/cellCertificateImport'

/**
 * A cell not in the uploaded file still goes onto the new certificate. If it is on the current certificate it is
 * carried forward unchanged; otherwise it is added, at the values Residential locations holds.
 */
export const CARRIED_FORWARD_STATUS = 'CARRIED_FORWARD'

export const ADDED_STATUS = 'ADDED'

export const CARRIED_FORWARD_MESSAGE =
  'Not on the uploaded file. Carried forward unchanged from the current cell certificate.'

export const CARRIED_FORWARD_PREVIEW_MESSAGE =
  'Not on the uploaded file. Would be carried forward unchanged from the current cell certificate.'

export const ADDED_MESSAGE =
  'Not on the uploaded file. Added to the new cell certificate using the values Residential locations holds.'

export const ADDED_PREVIEW_MESSAGE =
  'Not on the uploaded file. Would be added to the new cell certificate using the values Residential locations holds.'

const ARCHIVED_LOCATION_MESSAGE = 'Archived location'

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

// Cells that had no row in the upload still go onto the certificate, at the values shown: those they are certified at
// when carried forward, or the values the location holds when added. They are rows alongside the uploaded cells so
// the person reviewing can judge them. There is no before and after for them, so each column shows the single value.
// The key links to the location, which is why the API returns its id.
export const notOnCertificateLocationRows = (
  locationsNotOnCertificate: CellCertificateImportOmittedLocation[] | undefined,
  prisonId?: string,
  preview = false,
) =>
  (locationsNotOnCertificate || []).map(location => {
    const carriedForward = Boolean(location.onCurrentCertificate)
    const addedMessage = preview ? ADDED_PREVIEW_MESSAGE : ADDED_MESSAGE
    const carriedForwardMessage = preview ? CARRIED_FORWARD_PREVIEW_MESSAGE : CARRIED_FORWARD_MESSAGE
    return {
      locationKey: location.locationKey,
      url: prisonId && location.locationId ? paths.location.view(prisonId, location.locationId) : undefined,
      status: carriedForward ? CARRIED_FORWARD_STATUS : ADDED_STATUS,
      message: carriedForward ? carriedForwardMessage : addedMessage,
      needsReview: false,
      certificateChange: undefined as string | undefined,
      maxCapacity: heldAndCertifiedCell(location.maxCapacity, undefined),
      workingCapacity: heldAndCertifiedCell(location.workingCapacity, undefined),
      certifiedNormalAccommodation: heldAndCertifiedCell(location.certifiedNormalAccommodation, undefined),
    }
  })

// Whether the import recorded what the current certificate held for its cells. It is recorded for every import made
// once the API started doing so, but an older import, or a prison with no certificate, has none - and then a cell
// cannot be called "new to the certificate".
export const hasCurrentCertificateValues = (certificateImport: CellCertificateImport) =>
  (certificateImport.locations || []).some(
    location => location.currentCertifiedMaxCapacity !== undefined && location.currentCertifiedMaxCapacity !== null,
  ) || Boolean(certificateImport.carriedForwardRecords)

// For a cell in the file, how the new certificate differs from the current one. "No change" in the Result column is
// about Residential locations; the certificate records the uploaded values whatever the location ends up holding,
// so it can change when the location does not. A failed row and an archived location put nothing on the certificate.
export const certificateChangeText = (
  location: CellCertificateImportLocation,
  hasCurrentCertificate: boolean,
): string | undefined => {
  if (location.status === 'FAILED' || location.status === 'PENDING') return undefined
  if (location.message === ARCHIVED_LOCATION_MESSAGE) return undefined

  const current = {
    max: location.currentCertifiedMaxCapacity,
    working: location.currentCertifiedWorkingCapacity,
    cna: location.currentCertifiedNormalAccommodation,
  }
  if ([current.max, current.working, current.cna].every(value => value === undefined || value === null)) {
    return hasCurrentCertificate ? 'New to the certificate' : undefined
  }

  const changes = [
    ['max capacity', current.max, location.maxCapacity],
    ['working capacity', current.working, location.workingCapacity],
    ['CNA', current.cna, location.certifiedNormalAccommodation ?? location.previousCertifiedNormalAccommodation],
  ]
    .filter(([, before, after]) => after !== undefined && after !== null && before !== after)
    .map(([label, before, after]) => `${label} ${before ?? '-'} → ${after}`)

  return changes.length ? `Certificate: ${changes.join(', ')}` : undefined
}

// Cells needing review first, then cells added from outside the file, then cells whose certified values change,
// then failed rows, then the rest (unchanged cells and those carried forward). Array sort is stable, so each group
// keeps the location order the API returned.
const rowOrder = (row: { needsReview: boolean; status: string; certificateChange?: string }) => {
  if (row.needsReview) return 0
  if (row.status === ADDED_STATUS) return 1
  if (row.certificateChange) return 2
  if (row.status === 'FAILED') return 3
  return 4
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

  const hasCurrentCertificate = hasCurrentCertificateValues(certificateImport)
  const uploadedRows = (certificateImport.locations || []).map(location => ({
    locationKey: location.locationKey,
    status: location.status,
    message: location.message,
    certificateChange: certificateChangeText(location, hasCurrentCertificate),
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
    carriedForwardRecords: certificateImport.carriedForwardRecords || 0,
    addedRecords: (certificateImport.notOnCertificateRecords || 0) - (certificateImport.carriedForwardRecords || 0),
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
