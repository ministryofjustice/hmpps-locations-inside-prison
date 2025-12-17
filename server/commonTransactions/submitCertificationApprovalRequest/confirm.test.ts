import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../services/manageUsersService'
import NotificationService, { NotificationType, notificationGroups } from '../../services/notificationService'
import LocationsService from '../../services/locationsService'
import Confirm from './confirm'
import * as notificationHelpers from '../../utils/notificationHelpers'

jest.mock('../../utils/notificationHelpers')
jest.mock('../../middleware/getPrisonResidentialSummary')
jest.mock('../../middleware/populateLocation')

describe('Confirm', () => {
  const controller = new Confirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = {
    getAccommodationTypes: jest.fn(),
    getSpecialistCellTypes: jest.fn(),
    getUsedForTypes: jest.fn(),
    getResidentialSummary: jest.fn(),
    createCertificationRequestForSignedOpCap: jest.fn(),
    createCertificationRequestForLocation: jest.fn(),
  } as unknown as jest.Mocked<LocationsService>
  const manageUsersService = {} as jest.Mocked<ManageUsersService>
  const notifyService = {} as jest.Mocked<NotificationService>

  beforeEach(() => {
    locationsService.getAccommodationTypes.mockResolvedValue([])
    locationsService.getSpecialistCellTypes.mockResolvedValue([])
    locationsService.getUsedForTypes.mockResolvedValue([])
    locationsService.getResidentialSummary.mockResolvedValue({
      subLocations: [],
    } as any)
    locationsService.createCertificationRequestForSignedOpCap.mockResolvedValue(undefined)
    locationsService.createCertificationRequestForLocation.mockResolvedValue({ id: 'some-uuid' } as any)

    deepReq = {
      session: {
        systemToken: 'token',
      },
      services: {
        locationsService,
        manageUsersService,
        notifyService,
      },
      sessionModel: {
        get: jest.fn(),
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
      flash: jest.fn(),
    }
    deepRes = {
      locals: {
        location: {
          id: 'some-uuid',
          prisonId: 'MDI',
          leafLevel: true,
        },
        prisonResidentialSummary: {
          prisonSummary: {
            prisonName: 'Moorland (HMP & YOI)',
            signedOperationalCapacity: 200,
          },
        },
        user: {
          name: 'Joe Submitter',
        },
        prisonId: 'MDI',
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
    jest.clearAllMocks()
    ;(notificationHelpers.getUserEmails as jest.Mock)
      .mockResolvedValueOnce(['certificate_reviewer@test.com'])
      .mockResolvedValueOnce(['certificate_administrator@test.com', 'certificate_viewer@test.com'])
    ;(notificationHelpers.sendNotification as jest.Mock).mockResolvedValue(undefined)
  })

  describe('saveValues', () => {
    it('gets user emails for both request received and request submitted groups', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.getUserEmails).toHaveBeenNthCalledWith(
        1,
        manageUsersService,
        'token',
        'MDI',
        notificationGroups.requestReceivedUsers,
      )
      expect(notificationHelpers.getUserEmails).toHaveBeenNthCalledWith(
        2,
        manageUsersService,
        'token',
        'MDI',
        notificationGroups.requestSubmittedUsers,
      )
    })

    it('sends REQUEST_RECEIVED notification to reviewers', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        1,
        notifyService,
        ['certificate_reviewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/some-uuid/review'),
        NotificationType.REQUEST_RECEIVED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )
    })

    it('sends REQUEST_SUBMITTED notification to admin and viewers', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        2,
        notifyService,
        ['certificate_administrator@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/some-uuid'),
        NotificationType.REQUEST_SUBMITTED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )
    })

    it('creates certification request for signed op cap when present', async () => {
      ;(deepReq.sessionModel.get as jest.Mock).mockReturnValue({
        signedOperationalCapacity: 550,
        reasonForChange: 'New location built',
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.createCertificationRequestForSignedOpCap).toHaveBeenCalledWith(
        'token',
        'MDI',
        550,
        'New location built',
      )
    })

    it('does not create signed op cap request when not present', async () => {
      ;(deepReq.sessionModel.get as jest.Mock).mockReturnValue(undefined)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.createCertificationRequestForSignedOpCap).not.toHaveBeenCalled()
    })

    it('resets journey and session models', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets flash success message for single change request', async () => {
      ;(deepReq.sessionModel.get as jest.Mock).mockReturnValue(undefined)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request sent',
        content: 'You have submitted a request to update the cell certificate.',
      })
    })

    it('sets flash success message for multiple change requests', async () => {
      ;(deepReq.sessionModel.get as jest.Mock).mockReturnValue({
        signedOperationalCapacity: 550,
        reasonForChange: 'New location built',
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change requests sent',
        content: 'You have submitted 2 requests to update the cell certificate.',
      })
    })

    it('redirects to change requests page', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })
})
