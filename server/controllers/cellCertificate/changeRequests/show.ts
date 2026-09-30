import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import approvalTypeDescription from '../../../formatters/approvalTypeDescription'
import populateCertificationRequestDetails from '../../../middleware/populateCertificationRequestDetails'
import paths from '../../../utils/paths'
import {
  ADDED_STATUS,
  capacityCell,
  certificateChangeText,
  hasCurrentCertificateValues,
  notOnCertificateLocationRows,
} from '../../cellCertificateImports/detail'
import LocationsService from '../../../services/locationsService'

/**
 * The results of the import behind an "Initial cell certificate import" request, so the people reviewing
 * the import can see which cells need attention without going looking for the report. Only the cells needing
 * review, the rows that failed, the cells whose certified values change and the cells added from outside the
 * uploaded file are listed - a prison's import covers every cell - with a link through to the full report. Cells
 * carried forward unchanged from the current certificate are only counted.
 *
 * Returns undefined when there is no import to show: imports predating the link between an import and its
 * approval request have nothing to find, and that must leave the page as it was rather than break it.
 */
const importResults = async (
  locationsService: LocationsService,
  systemToken: string,
  prisonId: string,
  approvalRequestId: string,
) => {
  try {
    const certificateImport = await locationsService.getCellCertificateImportByApprovalRequest(
      systemToken,
      approvalRequestId,
    )

    const hasCurrentCertificate = hasCurrentCertificateValues(certificateImport)

    return {
      certificateImport,
      reportUrl: `${paths.prison.cellCertificateImports(prisonId)}/import/${certificateImport.id}`,
      carriedForwardRecords: certificateImport.carriedForwardRecords || 0,
      addedRecords: (certificateImport.notOnCertificateRecords || 0) - (certificateImport.carriedForwardRecords || 0),
      rows: [
        ...(certificateImport.locations || [])
          .map(location => ({ location, certificateChange: certificateChangeText(location, hasCurrentCertificate) }))
          .filter(
            ({ location, certificateChange }) =>
              location.workingCapacityMismatch ||
              location.maxCapacityMismatch ||
              location.certifiedNormalAccommodationMismatch ||
              location.status === 'FAILED' ||
              certificateChange,
          )
          .map(({ location, certificateChange }) => ({
            locationKey: location.locationKey,
            status: location.status,
            message: location.message,
            certificateChange,
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
          })),
        ...notOnCertificateLocationRows(certificateImport.locationsNotOnCertificate, prisonId).filter(
          row => row.status === ADDED_STATUS,
        ),
      ],
    }
  } catch {
    return undefined
  }
}

export default async (req: Request, res: Response) => {
  await populateCertificationRequestDetails(req, res)

  const { approvalRequest, constants, prisonId, location } = res.locals
  const locals: TypedLocals = {
    ...res.locals,
    backLink:
      approvalRequest.status === 'APPROVED'
        ? paths.cellCertificate.history(prisonId)
        : paths.cellCertificate.changeRequest.view(prisonId),
    backLinkText: `Back${approvalRequest.status === 'PENDING' ? ' to change requests' : ''}`,
    title: `${approvalTypeDescription(approvalRequest, constants, location)} request details`,
  }

  // Match the approval type, never the description - that string comes from the API's constants, and the
  // neighbouring PRISON_BASELINE ("Initial certificate generation") is a different thing entirely.
  if (approvalRequest.approvalType === 'CELL_CERTIFICATE_UPLOAD') {
    locals.importResults = await importResults(
      req.services.locationsService,
      req.session.systemToken,
      prisonId,
      approvalRequest.id,
    )
  }

  return res.render('pages/cellCertificate/changeRequests/show', locals)
}
