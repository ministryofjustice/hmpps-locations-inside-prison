import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../../../services/manageUsersService'
import NotificationService, { notificationGroups, NotificationType } from '../../../../services/notificationService'
import LocationsService from '../../../../services/locationsService'
import Approve from './approve'
import * as notificationHelpers from '../../../../utils/notificationHelpers'

jest.mock('../../../../utils/notificationHelpers')
jest.mock('../../../../middleware/populateCertificationRequestDetails')

describe('Approve', () => {
  const controller = new Approve({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  const notifyService = new NotificationService(null) as jest.Mocked<NotificationService>

  beforeEach(() => {
    locationsService.approveCertificationRequest = jest.fn().mockResolvedValue(undefined)

    deepReq = {
      session: {
        systemToken: 'token',
      },
      services: {
        locationsService,
        manageUsersService,
        notifyService,
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
          locationId: 'some-location-id',
        },
        notificationDetails: {
          prisonName: 'Moorland (HMP & YOI)',
        },
        prisonId: 'MDI',
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
  })

  describe('saveValues', () => {
    it('gets user emails for approved request notification group', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.getUserEmails).toHaveBeenCalledWith(
        manageUsersService,
        'token',
        'MDI',
        notificationGroups.allCertUsers,
      )
    })

    it('sends REQUEST_APPROVED notification to all cert users', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(notificationHelpers.sendNotification).toHaveBeenCalledWith(
        notifyService,
        ['certificate_administrator@test.com', 'certificate_reviewer@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        'http://localhost:3000/MDI/cell-certificate/some-uuid',
        NotificationType.REQUEST_APPROVED,
      )
    })

    it('resets journey and session models', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('redirects to change requests page', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })
})
