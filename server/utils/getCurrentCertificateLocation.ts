import { Request } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { CertificateLocation } from '../data/types/locationsApi/certificateLocation'

type CertificateLocations = Promise<Record<string, CertificateLocation>>

// The current certificate is fetched once per request, however many cells need their entry from it
const certificatesByRequest = new WeakMap<Request | FormWizard.Request, Record<string, CertificateLocations>>()

/**
 * Returns the location's entry on the prison's current cell certificate, the same as the API's currentCellCertificate,
 * without one API call per location. Undefined if the location is not on the certificate or there is no certificate.
 */
export default async function getCurrentCertificateLocation(
  req: Request | FormWizard.Request,
  prisonId: string,
  pathHierarchy: string,
): Promise<CertificateLocation | undefined> {
  let certificates = certificatesByRequest.get(req)
  if (!certificates) {
    certificates = {}
    certificatesByRequest.set(req, certificates)
  }

  certificates[prisonId] ??= req.services.locationsService.getCurrentCellCertificateLocations(
    req.session.systemToken,
    prisonId,
  )

  return (await certificates[prisonId])[pathHierarchy]
}
