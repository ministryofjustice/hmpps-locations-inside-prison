import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmCellCapacity from './confirm'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ConfirmCellCapacity', () => {
  const controller = new ConfirmCellCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let permissions: { [permission: string]: boolean }
  let sessionModel: { [key: string]: unknown }

  beforeEach(() => {
    permissions = {}
    sessionModel = { maxCapacity: '3', workingCapacity: '1', baselineCna: '2' }
    deepReq = {
      canAccess: (permission: string) => permissions[permission],
      form: {
        values: {
          maxCapacity: '3',
          workingCapacity: '1',
        },
      },
      services: {
        analyticsService,
        locationsService,
      },
      session: {
        referrerUrl: '/',
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn((fieldName?: string) => sessionModel[fieldName]) as FormWizard.Request['sessionModel']['get'],
        set: jest.fn((fieldName?: string, value?: unknown) => {
          sessionModel[fieldName] = value
        }),
      },
    }
    deepRes = {
      locals: {
        values: {
          maxCapacity: 2,
          workingCapacity: 2,
        },
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
          prisonId: 'TST',
        }),
        prisonConfiguration: {
          certificationApprovalRequired: 'ACTIVE',
        },
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        user: {
          username: 'HSLUGHORN',
        },
      },
    }
    next = jest.fn()

    locationsService.updateCapacity = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual({
        backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/change',
        buttonText: 'Update cell capacity',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
You are increasing the cell’s maximum capacity by 1.
<br/><br/>
This will increase the establishment’s maximum capacity from 30 to 31.`,
        title: 'Confirm cell capacity',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('saveValues', () => {
    describe('when !canEditCna', () => {
      beforeEach(() => {
        deepRes.locals.decoratedLocation.status = 'ACTIVE'
      })

      it('calls locationsService without CNA change', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', deepRes.locals.decoratedLocation.id, {
          maxCapacity: 3,
          workingCapacity: 1,
        })
      })
    })

    describe('when canEditCna', () => {
      beforeEach(() => {
        deepRes.locals.decoratedLocation.status = 'DRAFT'
      })

      it('calls locationsService with CNA', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', deepRes.locals.decoratedLocation.id, {
          maxCapacity: 3,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
        })
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_cell_capacity', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
