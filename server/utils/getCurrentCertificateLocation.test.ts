import { Request } from 'express'
import { DeepPartial } from 'fishery'
import getCurrentCertificateLocation from './getCurrentCertificateLocation'
import CertificateLocationFactory from '../testutils/factories/certificateLocation'

describe('getCurrentCertificateLocation', () => {
  const cell1 = CertificateLocationFactory.build({ pathHierarchy: 'A-1-001' })
  const cell2 = CertificateLocationFactory.build({ pathHierarchy: 'A-1-002' })
  let getCurrentCellCertificateLocations: jest.Mock
  let deepReq: DeepPartial<Request>

  beforeEach(() => {
    getCurrentCellCertificateLocations = jest.fn().mockResolvedValue({ 'A-1-001': cell1, 'A-1-002': cell2 })
    deepReq = {
      session: { systemToken: 'token' },
      services: { locationsService: { getCurrentCellCertificateLocations } },
    }
  })

  it("returns the location's certificate entry, fetching the certificate once per request", async () => {
    const req = deepReq as Request

    expect(
      await Promise.all([
        getCurrentCertificateLocation(req, 'TST', 'A-1-001'),
        getCurrentCertificateLocation(req, 'TST', 'A-1-002'),
        getCurrentCertificateLocation(req, 'TST', 'A-1-003'),
      ]),
    ).toEqual([cell1, cell2, undefined])
    expect(getCurrentCellCertificateLocations).toHaveBeenCalledTimes(1)
    expect(getCurrentCellCertificateLocations).toHaveBeenCalledWith('token', 'TST')
  })

  it('fetches the certificate again for a new request', async () => {
    await getCurrentCertificateLocation(deepReq as Request, 'TST', 'A-1-001')
    await getCurrentCertificateLocation({ ...deepReq } as Request, 'TST', 'A-1-001')

    expect(getCurrentCellCertificateLocations).toHaveBeenCalledTimes(2)
  })
})
