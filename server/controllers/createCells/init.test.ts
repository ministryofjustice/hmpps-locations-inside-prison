import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import CreateCellsInit from './init'

describe('CreateCellsInit', () => {
  const controller = new CreateCellsInit({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      form: { options: {} },
      session: {},
      sessionModel: { set: jest.fn() },
      query: {
        prisonId: 'TST',
        locationId: 'l0',
      },
    }
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          subLocationName: 'Wings',
          location: {
            prisonId: 'TST',
            id: '7e570000-0000-0000-0000-000000000001',
            locationType: 'Landing',
            localName: 'Landing A',
          },
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('successHandler', () => {
    it('redirects if location status is LOCKED_DRAFT', () => {
      deepRes.locals.decoratedResidentialSummary.location = {
        ...deepRes.locals.decoratedResidentialSummary.location,
        status: 'LOCKED_DRAFT',
        pendingApprovalRequestId: 'REQUEST-ID-0000-1000',
      }

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })

    it('sets values on the sessionModel', () => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationType', 'Landing')
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationId', '7e570000-0000-0000-0000-000000000001')
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('localName', 'Landing A')
    })
  })
})
