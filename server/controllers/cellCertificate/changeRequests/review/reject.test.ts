import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../../../services/manageUsersService'
import NotificationService, { notificationGroups, NotificationType } from '../../../../services/notificationService'
import LocationsService from '../../../../services/locationsService'
import Reject from './reject'
import * as notificationHelpers from '../../../../utils/notificationHelpers'

jest.mock('../../../../utils/notificationHelpers')
jest.mock('../../../../middleware/populateCertificationRequestDetails')

describe('Reject', () => {
  const controller = new Reject({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  const notifyService = new NotificationService(null) as jest.Mocked<NotificationService>

  beforeEach(() => {
    deepReq = {
      session: {
        systemToken: 'token',
      },
      services: {
        locationsService,
        manageUsersService,
        notifyService,
      },
      form: {
        values: {
          explanation: 'Nope, sorry',
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      sessionModel: {
        reset: jest.fn(),
      },
      flash: jest.fn(),
    }
    deepRes = {
      locals: {
        approvalRequest: {
          id: 'some-uuid',
          locationId: 'some-location-uuid',
        },
        notificationDetails: {
          prisonName: 'Moorland (HMP & YOI)',
          requestedBy: 'John Submitter',
          locationName: 'WING-NEW',
          changeType: 'Add new locations to certificate',
          requestedDate: '2025-01-01T10:30:00Z',
        },
        prisonId: 'MDI',
        user: {
          name: 'Joe Reviewer',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    jest.clearAllMocks()
    ;(notificationHelpers.getUserEmails as jest.Mock).mockResolvedValue([
      'certificate_administrator@test.com',
      'certificate_requester@test.com',
      'certificate_viewer@test.com',
    ])
    ;(notificationHelpers.sendNotification as jest.Mock).mockResolvedValue(undefined)
    jest.spyOn(locationsService, 'rejectCertificationRequest').mockResolvedValue(undefined)
  })

  describe('saveValues', () => {
    it('gets user emails for rejected request notification group', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.getUserEmails).toHaveBeenCalledWith(
        manageUsersService,
        'token',
        'MDI',
        notificationGroups.allCertUsers,
      )
    })

    it('sends REQUEST_REJECTED notification to all cert users', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.sendNotification).toHaveBeenCalledWith(
        notifyService,
        ['certificate_administrator@test.com', 'certificate_requester@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        undefined,
        NotificationType.REQUEST_REJECTED,
        'WING-NEW',
        'Add new locations to certificate',
        '1 January 2025 at 10:30',
        'John Submitter',
        undefined,
        undefined,
        'Joe Reviewer',
        'Nope, sorry',
      )
    })

    it('resets journey and session models', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets flash success message', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request rejected',
        content: 'The establishment has been notified that the requested change has been rejected.',
      })
    })

    it('redirects to change requests page', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })
})
