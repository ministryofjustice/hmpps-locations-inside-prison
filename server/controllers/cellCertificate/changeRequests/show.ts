import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import approvalTypeDescription from '../../../formatters/approvalTypeDescription'
import populateCertificationRequestDetails from '../../../middleware/populateCertificationRequestDetails'
import paths from '../../../utils/paths'
import { capacityCell } from '../../cellCertificateImports/detail'
import LocationsService from '../../../services/locationsService'

/**
 * The results of the import behind an "Initial cell certificate import" request, so the people reviewing
 * the import can see which cells need attention without going looking for the report. Only the cells needing
 * review are listed - a prison's import covers every cell - with a link through to the full report.
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

    return {
      certificateImport,
      reportUrl: `${paths.prison.cellCertificateImports(prisonId)}/import/${certificateImport.id}`,
      rows: (certificateImport.locations || [])
        .filter(
          location =>
            location.workingCapacityMismatch ||
            location.maxCapacityMismatch ||
            location.certifiedNormalAccommodationMismatch ||
            location.status === 'FAILED',
        )
        .map(location => ({
          locationKey: location.locationKey,
          status: location.status,
          message: location.message,
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
