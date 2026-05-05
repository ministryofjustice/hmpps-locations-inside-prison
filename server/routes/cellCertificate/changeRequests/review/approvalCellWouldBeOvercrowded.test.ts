import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import { Response } from 'express'
import approvalCellWouldBeOvercrowded from './approvalCellWouldBeOvercrowded'

describe('approvalCellWouldBeOvercrowded', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      sessionModel: {
        get: jest.fn().mockReturnValue('APPROVE'),
      },
    }
    deepRes = {
      locals: {
        approvalRequest: {
          approvalType: 'CAPACITY_CHANGE',
          locations: [{ workingCapacity: 2 }],
        },
        prisonerLocation: {
          prisoners: [{ prisonerNumber: 'A1234BC' }, { prisonerNumber: 'B5678DE' }, { prisonerNumber: 'C9012FG' }],
        },
      },
    } as typeof deepRes
  })

  it('returns false when approveOrReject is not APPROVE', () => {
    ;(deepReq.sessionModel.get as jest.Mock).mockReturnValue('REJECT')
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when approvalType is not CAPACITY_CHANGE', () => {
    deepRes.locals.approvalRequest.approvalType = 'DRAFT'
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when approvalRequest is absent', () => {
    deepRes.locals.approvalRequest = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns true when occupants exceed proposed working capacity', () => {
    // 3 prisoners, working capacity 2
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(true)
  })

  it('returns false when occupants equal proposed working capacity', () => {
    deepRes.locals.prisonerLocation.prisoners = [
      { prisonerNumber: 'A1234BC' },
      { prisonerNumber: 'B5678DE' },
    ] as (typeof deepRes)['locals']['prisonerLocation']['prisoners']
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when occupants are below proposed working capacity', () => {
    deepRes.locals.prisonerLocation.prisoners = [
      { prisonerNumber: 'A1234BC' },
    ] as (typeof deepRes)['locals']['prisonerLocation']['prisoners']
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when there are no occupants and working capacity is 0', () => {
    deepRes.locals.prisonerLocation = undefined
    deepRes.locals.approvalRequest.locations = [{ workingCapacity: 0 }]
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when there are no occupants', () => {
    deepRes.locals.prisonerLocation = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('treats missing locations as working capacity of 0 and returns true when there are occupants', () => {
    deepRes.locals.approvalRequest.locations = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(true)
  })
})
