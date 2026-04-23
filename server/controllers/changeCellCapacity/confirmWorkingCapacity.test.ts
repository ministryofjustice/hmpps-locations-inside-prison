import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmWorkingCapacity from './confirmWorkingCapacity'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import LocationFactory from '../../testutils/factories/location'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ConfirmWorkingCapacity', () => {
  const controller = new ConfirmWorkingCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let sessionModel: { [key: string]: unknown }

  beforeEach(() => {
    sessionModel = { maxCapacity: '3', workingCapacity: '1', baselineCna: '2' }

    deepReq = {
      flash: jest.fn(),
      journeyModel: {
        reset: jest.fn(),
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
        reset: jest.fn(),
        set: jest.fn((fieldName?: string, value?: unknown) => {
          sessionModel[fieldName] = value
        }),
      },
    }

    const baseLocation = LocationFactory.build({
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      pathHierarchy: 'A-1-001',
      prisonId: 'TST',
      capacity: {
        maxCapacity: 2,
        workingCapacity: 2,
        certifiedNormalAccommodation: 2,
      },
    })

    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation(baseLocation),
        fields: {
          baselineCna: {
            removed: false,
          },
        },
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.updateCapacity = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('generateChangeSummary', () => {
    it('returns null when there is no change', () => {
      expect(controller.generateChangeSummary(2, 2, 20)).toBeNull()
    })

    it('returns increase text when the value increases', () => {
      expect(controller.generateChangeSummary(2, 5, 20)).toEqual(`You are increasing the cell's working capacity by 3.
<br/><br/>
This will increase the establishment's working capacity from 20 to 23.`)
    })

    it('returns decrease text when the value decreases', () => {
      expect(controller.generateChangeSummary(5, 2, 20)).toEqual(`You are decreasing the cell's working capacity by 3.
<br/><br/>
This will decrease the establishment's working capacity from 20 to 17.`)
    })
  })

  describe('locals', () => {
    it('formats the page content correctly', async () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/change',
        buttonText: 'Update certified working capacity',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are decreasing the cell's working capacity by 1.
<br/><br/>
This will decrease the establishment's working capacity from 20 to 19.`,
        title: 'Do you want to update certified working capacity?',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService with baseline CNA when it is present', async () => {
      deepRes.locals.fields.baselineCna.removed = false

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', deepRes.locals.decoratedLocation.id, {
        maxCapacity: 3,
        workingCapacity: 1,
        certifiedNormalAccommodation: 2,
      })
    })

    it('calls locationsService without baseline CNA when it is removed', async () => {
      deepRes.locals.fields.baselineCna.removed = true

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', deepRes.locals.decoratedLocation.id, {
        maxCapacity: 3,
        workingCapacity: 1,
      })
    })

    it('sends an analytics event when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_cell_capacity', { prison_id: 'TST' })
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })

    it('calls next with an error when the API call fails', async () => {
      const error = new Error('API error')
      ;(locationsService.updateCapacity as jest.Mock).mockRejectedValue(error)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('resets the journey model', () => {
      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Working capacity updated',
        content: 'You have updated the working capacity of A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })
})
