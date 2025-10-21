import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import CreateLocationInit from './init'

describe('CreateLocationInit', () => {
  const controller = new CreateLocationInit({ route: '/' })
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
            id: 'locationId',
          },
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('successHandler', () => {
    it('redirects if location status is LOCKED_DRAFT', () => {
      deepRes.locals.decoratedResidentialSummary.location = {
        status: 'LOCKED_DRAFT',
        prisonId: 'TST',
        pendingApprovalRequestId: 'REQUEST-ID-0000-1000',
      }

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST')
    })

    it('sets values on the sessionModel', () => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationType', 'WING')
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationId', 'locationId')
    })
  })
})
