import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import conditionallyPopulatePrisoners from './conditionallyPopulatePrisoners'
import LocationsService from '../../../../services/locationsService'

import populatePrisonersInLocation from '../../../../middleware/populatePrisonersInLocation'
import { PrisonerLocation } from '../../../../data/types/locationsApi'

jest.mock('../../../../middleware/populatePrisonersInLocation', () =>
  jest.fn(() =>
    jest.fn(async (req: FormWizard.Request, res: Response) => {
      res.locals.prisonerLocation = {
        prisoners: [{ prisonerNumber: 'A1234BC' }],
      } as DeepPartial<PrisonerLocation> as any
    }),
  ),
)

describe('conditionallyPopulatePrisoners', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
      form: {
        values: {
          approveOrReject: 'APPROVE',
        },
      },
      services: {
        locationsService,
      },
      session: {
        systemToken: 'token',
      },
    }
    deepRes = {
      locals: {
        approvalRequest: {
          approvalType: 'CAPACITY_CHANGE',
          locationId: 'some-location-uuid',
        },
      },
    }
    next = jest.fn()

    jest.clearAllMocks()
    ;(populatePrisonersInLocation as jest.Mock).mockReturnValue(
      jest.fn(async (_req: FormWizard.Request, res: Response) => {
        res.locals.prisonerLocation = {
          prisoners: [{ prisonerNumber: 'A1234BC' }],
        } as DeepPartial<PrisonerLocation> as any
      }),
    )
  })

  describe('when approveOrReject is not APPROVE', () => {
    beforeEach(() => {
      deepReq.form.values.approveOrReject = 'REJECT'
    })

    it('calls next without populating prisoners', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(populatePrisonersInLocation).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when approvalType is not CAPACITY_CHANGE', () => {
    beforeEach(() => {
      deepRes.locals.approvalRequest.approvalType = 'DRAFT'
    })

    it('calls next without populating prisoners', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(populatePrisonersInLocation).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when approvalRequest is absent', () => {
    beforeEach(() => {
      deepRes.locals.approvalRequest = undefined
    })

    it('calls next without populating prisoners', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(populatePrisonersInLocation).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when approveOrReject is APPROVE and approvalType is CAPACITY_CHANGE', () => {
    it('sets res.locals.locationId from the approval request', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.locationId).toBe('some-location-uuid')
    })

    it('calls populatePrisonersInLocation', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(populatePrisonersInLocation).toHaveBeenCalled()
    })

    it('calls next after populating prisoners', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })

    it('populates res.locals.prisonerLocation', async () => {
      await conditionallyPopulatePrisoners(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.prisonerLocation).toEqual({ prisoners: [{ prisonerNumber: 'A1234BC' }] })
    })
  })
})
