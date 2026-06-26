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
          locations: [{ accommodationTypes: ['NORMAL_ACCOMMODATION'], locationType: 'CELL', workingCapacity: 2 }],
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

  it('returns false when approvalRequest is absent', () => {
    deepRes.locals.approvalRequest = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns true when NORMAL_ACCOMMODATION, CELL, and occupants exceed proposed working capacity', () => {
    // 3 prisoners, working capacity 2
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(true)
  })

  it('returns false when not NORMAL_ACCOMMODATION and occupants exceed proposed working capacity', () => {
    deepRes.locals.approvalRequest.locations[0].accommodationTypes = ['CARE_AND_SEPARATION']
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when not a CELL and occupants exceed proposed working capacity', () => {
    deepRes.locals.approvalRequest.locations[0].locationType = 'LANDING'
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns true when occupants exceed proposed max capacity', () => {
    deepRes.locals.approvalRequest.locations[0].workingCapacity = undefined
    deepRes.locals.approvalRequest.locations[0].maxCapacity = 0
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(true)
  })

  it('returns false when working capacity and max capacity are absent', () => {
    deepRes.locals.approvalRequest.locations[0].maxCapacity = undefined
    deepRes.locals.approvalRequest.locations[0].workingCapacity = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
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

  it('returns false when occupants equal proposed max capacity', () => {
    deepRes.locals.approvalRequest.locations[0].workingCapacity = undefined
    deepRes.locals.approvalRequest.locations[0].maxCapacity = 2
    deepRes.locals.prisonerLocation.prisoners = [
      { prisonerNumber: 'A1234BC' },
      { prisonerNumber: 'B5678DE' },
    ] as (typeof deepRes)['locals']['prisonerLocation']['prisoners']
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when occupants are below proposed max capacity', () => {
    deepRes.locals.approvalRequest.locations[0].workingCapacity = undefined
    deepRes.locals.approvalRequest.locations[0].maxCapacity = 2
    deepRes.locals.prisonerLocation.prisoners = [
      { prisonerNumber: 'A1234BC' },
    ] as (typeof deepRes)['locals']['prisonerLocation']['prisoners']
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when there are no occupants and max capacity is 0', () => {
    deepRes.locals.approvalRequest.locations[0].workingCapacity = undefined
    deepRes.locals.approvalRequest.locations[0].maxCapacity = 0
    deepRes.locals.prisonerLocation = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })

  it('returns false when there are no occupants', () => {
    deepRes.locals.prisonerLocation = undefined
    expect(approvalCellWouldBeOvercrowded(deepReq as FormWizard.Request, deepRes as Response)).toBe(false)
  })
})
