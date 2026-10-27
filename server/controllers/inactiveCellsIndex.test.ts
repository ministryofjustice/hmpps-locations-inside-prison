import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import inactiveCellsIndex from './inactiveCellsIndex'
import LocationFactory from '../testutils/factories/location'
import CertificationApprovalRequestFactory from '../testutils/factories/certificationApprovalRequest'
import buildDecoratedLocation from '../testutils/buildDecoratedLocation'

describe('inactiveCellsIndex', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const wing = LocationFactory.build({ id: 'wing', locationType: 'WING' })
  const cell1 = LocationFactory.build({ id: 'cell-1', pendingApprovalRequestId: 'request-1' })
  const cell2 = LocationFactory.build({ id: 'cell-2', pendingApprovalRequestId: 'request-2' })
  const cell3 = LocationFactory.build({ id: 'cell-3', pendingApprovalRequestId: 'request-2' })
  const request1 = CertificationApprovalRequestFactory.build({ id: 'request-1', locationId: 'cell-1' })
  const request2 = CertificationApprovalRequestFactory.build({ id: 'request-2', locationId: 'wing' })
  const otherRequest = CertificationApprovalRequestFactory.build({ id: 'other', locationId: 'elsewhere' })

  beforeEach(() => {
    deepReq = {
      flash: jest.fn().mockReturnValue([]),
      session: { systemToken: 'token' },
      services: {
        locationsService: {
          getCertificateApprovalRequests: jest.fn().mockResolvedValue([request1, otherRequest, request2]),
          getCertificateApprovalRequest: jest.fn(),
          getLocation: jest.fn().mockResolvedValue(wing),
          getApprovalTypes: jest.fn().mockResolvedValue({}),
          getLocationTypes: jest.fn().mockResolvedValue({}),
        },
        manageUsersService: {
          getUser: jest.fn().mockResolvedValue({ name: 'Joe Bloggs' }),
        },
      },
    }
    deepRes = {
      locals: {
        prisonId: 'TST',
        prisonConfiguration: { certificationApprovalRequired: 'ACTIVE' },
        inactiveCells: [cell1, cell2, cell3].map(c => buildDecoratedLocation(c)),
        user: { token: 'user-token' },
      },
      render: jest.fn(),
    }
  })

  it('gets the pending requests in one call', async () => {
    await inactiveCellsIndex(deepReq as Request, deepRes as Response)

    const { locationsService } = deepReq.services
    expect(locationsService.getCertificateApprovalRequests).toHaveBeenCalledTimes(1)
    expect(locationsService.getCertificateApprovalRequests).toHaveBeenCalledWith('token', 'TST')
    expect(locationsService.getCertificateApprovalRequest).not.toHaveBeenCalled()
    expect(deepRes.locals.approvalRequestMap).toEqual({ 'request-1': request1, 'request-2': request2 })
  })

  it('only looks up request locations that are not already listed', async () => {
    await inactiveCellsIndex(deepReq as Request, deepRes as Response)

    expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledTimes(1)
    expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledWith('token', 'wing')
    expect(deepRes.locals.locationMap).toEqual({ 'cell-1': cell1, wing })
  })

  it('looks up a request that is no longer pending on its own', async () => {
    deepReq.services.locationsService.getCertificateApprovalRequests = jest.fn().mockResolvedValue([request1])
    deepReq.services.locationsService.getCertificateApprovalRequest = jest.fn().mockResolvedValue(request2)

    await inactiveCellsIndex(deepReq as Request, deepRes as Response)

    expect(deepReq.services.locationsService.getCertificateApprovalRequest).toHaveBeenCalledTimes(1)
    expect(deepReq.services.locationsService.getCertificateApprovalRequest).toHaveBeenCalledWith('token', 'request-2')
    expect(deepRes.locals.approvalRequestMap).toEqual({ 'request-1': request1, 'request-2': request2 })
  })

  it('makes no request calls when no cell has a pending request', async () => {
    deepRes.locals.inactiveCells = [buildDecoratedLocation({ ...wing, pendingApprovalRequestId: undefined })]

    await inactiveCellsIndex(deepReq as Request, deepRes as Response)

    expect(deepReq.services.locationsService.getCertificateApprovalRequests).not.toHaveBeenCalled()
  })
})
