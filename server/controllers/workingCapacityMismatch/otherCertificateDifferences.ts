import { Location } from '../../data/types/locationsApi'

export interface CertificateDifference {
  label: string
  certifiedLabel: string
  current: number
  certified: number
}

/**
 * The values other than working capacity where the cell differs from its cell certificate.
 *
 * Matching the certificate sets these as well as the working capacity, so the user is told about them.
 */
export default function otherCertificateDifferences(cell: Location): CertificateDifference[] {
  const { capacity, currentCellCertificate: certificate } = cell
  if (!capacity || !certificate) return []

  return [
    {
      label: 'Maximum capacity',
      certifiedLabel: 'Certified maximum capacity',
      current: capacity.maxCapacity,
      certified: certificate.maxCapacity,
    },
    {
      label: 'Baseline CNA',
      certifiedLabel: 'Certified baseline CNA',
      current: capacity.certifiedNormalAccommodation,
      certified: certificate.certifiedNormalAccommodation,
    },
  ].filter(({ current, certified }) => current !== certified)
}
