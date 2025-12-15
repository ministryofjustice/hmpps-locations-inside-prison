import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../../services/manageUsersService'
import NotificationService, { notificationGroups, NotificationType } from '../../../services/notificationService'
import LocationsService from '../../../services/locationsService'
import Withdraw from './withdraw'
import * as notificationHelpers from '../../../utils/notificationHelpers'

jest.mock('../../../utils/notificationHelpers')
jest.mock('../../../services/locationsService')
jest.mock('../../../middleware/populateCertificationRequestDetails')

describe('Withdraw', () => {
  const controller = new Withdraw({ route: '/' })
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
          explanation: 'I dont like this request anymore',
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
          name: 'Joe Withdrawer',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    jest.clearAllMocks()
    ;(notificationHelpers.getUserEmails as jest.Mock).mockResolvedValue([
      'certificate_administrator@test.com',
      'certificate_reviewer@test.com',
      'certificate_viewer@test.com',
    ])
    ;(notificationHelpers.sendNotification as jest.Mock).mockResolvedValue(undefined)
    ;(locationsService.getLocation as jest.Mock).mockResolvedValue({
      locationType: 'Wing',
      localName: 'A',
      pathHierarchy: 'A',
    })
  })

  describe('saveValues', () => {
    it('gets user emails for withdrawn request notification group', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.getUserEmails).toHaveBeenCalledWith(
        manageUsersService,
        'token',
        'MDI',
        notificationGroups.allCertUsers,
      )
    })

    it('sends REQUEST_WITHDRAW notification to all cert users', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.sendNotification).toHaveBeenCalledWith(
        notifyService,
        ['certificate_administrator@test.com', 'certificate_reviewer@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        undefined,
        NotificationType.REQUEST_WITHDRAWN,
        'WING-NEW',
        'Add new locations to certificate',
        '1 January 2025 at 10:30',
        'John Submitter',
        'Joe Withdrawer',
        'I dont like this request anymore',
      )
    })

    it('resets journey and session models', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('gets location details', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.getLocation).toHaveBeenCalledWith('token', 'some-location-uuid')
    })

    it('sets flash success message with location details', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request withdrawn',
        content: 'You have withdrawn the change request for wing A.',
      })
    })

    it('redirects to change requests page', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })
})
