import otherCertificateDifferences from './otherCertificateDifferences'
import LocationFactory from '../../testutils/factories/location'
import CertificateLocationFactory from '../../testutils/factories/certificateLocation'

describe('otherCertificateDifferences', () => {
  const cell = (
    capacity: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
    certified: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
  ) => LocationFactory.build({ capacity, currentCellCertificate: CertificateLocationFactory.build(certified) })

  it('returns nothing when only the working capacity differs', () => {
    expect(
      otherCertificateDifferences(
        cell(
          { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
          { maxCapacity: 2, workingCapacity: 1, certifiedNormalAccommodation: 1 },
        ),
      ),
    ).toEqual([])
  })

  it('returns the maximum capacity when it differs from the certificate', () => {
    expect(
      otherCertificateDifferences(
        cell(
          { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
          { maxCapacity: 1, workingCapacity: 1, certifiedNormalAccommodation: 1 },
        ),
      ),
    ).toEqual([{ label: 'Maximum capacity', certifiedLabel: 'Certified maximum capacity', current: 2, certified: 1 }])
  })

  it('returns the maximum capacity and the baseline CNA when both differ from the certificate', () => {
    expect(
      otherCertificateDifferences(
        cell(
          { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 2 },
          { maxCapacity: 1, workingCapacity: 1, certifiedNormalAccommodation: 1 },
        ),
      ),
    ).toEqual([
      { label: 'Maximum capacity', certifiedLabel: 'Certified maximum capacity', current: 2, certified: 1 },
      { label: 'Baseline CNA', certifiedLabel: 'Certified baseline CNA', current: 2, certified: 1 },
    ])
  })

  it('returns nothing when the cell has no certificate', () => {
    expect(otherCertificateDifferences(LocationFactory.build({ currentCellCertificate: undefined }))).toEqual([])
  })
})
