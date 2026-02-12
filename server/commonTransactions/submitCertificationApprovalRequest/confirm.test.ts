import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../services/manageUsersService'
import NotificationService, { NotificationType, notificationGroups } from '../../services/notificationService'
import LocationsService from '../../services/locationsService'
import Confirm from './confirm'
import * as notificationHelpers from '../../utils/notificationHelpers'
import LocationFactory from '../../testutils/factories/location'

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
      form: {
        options: {
          name: 'add-to-certificate',
        },
      },
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
        location: LocationFactory.build({
          id: 'some-uuid',
          prisonId: 'MDI',
          leafLevel: true,
        }),
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
      ;(deepReq.sessionModel.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'proposedSignedOpCapChange') {
          return { signedOperationalCapacity: 550, reasonForChange: 'New location built' }
        }
        return undefined
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
      ;(deepReq.sessionModel.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'proposedSignedOpCapChange') {
          return { signedOperationalCapacity: 550, reasonForChange: 'New location built' }
        }
        return undefined
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

  describe('saveValues - changeDoorNumber', () => {
    beforeEach(() => {
      deepReq.form.options.name = 'change-door-number'
      ;(deepReq.sessionModel.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'doorNumber') return 'A1-02'
        if (key === 'explanation') return 'Need to change door number'
        return undefined
      })
      ;(deepRes.locals as any).locationId = 'loc-123'
      locationsService.updateCellMark = jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'req-123' })
    })

    it('updates cell mark with doorNumber and reason', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCellMark).toHaveBeenCalledWith('token', 'loc-123', {
        cellMark: 'A1-02',
        reasonForChange: 'Need to change door number',
      })
    })

    it('sends notifications using pendingApprovalRequestId', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        1,
        notifyService,
        ['certificate_reviewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/req-123/review'),
        NotificationType.REQUEST_RECEIVED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )

      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        2,
        notifyService,
        ['certificate_administrator@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/req-123'),
        NotificationType.REQUEST_SUBMITTED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )
    })

    it('sets single request flash message and redirects', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request sent',
        content: 'You have submitted a request to update the cell certificate.',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })

  describe('saveValues - changeCellSanitation', () => {
    beforeEach(() => {
      deepReq.form.options.name = 'change-sanitation'
      ;(deepReq.sessionModel.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'inCellSanitation') return 'YES'
        if (key === 'explanation') return 'Adding sanitation facilities'
        return undefined
      })
      ;(deepRes.locals as any).locationId = 'loc-456'
      locationsService.updateCellSanitation = jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'req-456' })
    })

    it('updates in cell sanitation with inCellSanitation and reason', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCellSanitation).toHaveBeenCalledWith('token', 'loc-456', {
        inCellSanitation: true,
        reasonForChange: 'Adding sanitation facilities',
      })
    })

    it('sends notifications using pendingApprovalRequestId', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        1,
        notifyService,
        ['certificate_reviewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/req-456/review'),
        NotificationType.REQUEST_RECEIVED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )

      expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
        2,
        notifyService,
        ['certificate_administrator@test.com', 'certificate_viewer@test.com'],
        'Moorland (HMP & YOI)',
        expect.stringContaining('/MDI/cell-certificate/change-requests/req-456'),
        NotificationType.REQUEST_SUBMITTED,
        undefined,
        undefined,
        undefined,
        'Joe Submitter',
      )
    })

    it('sets single request flash message and redirects', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request sent',
        content: 'You have submitted a request to update the cell certificate.',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })

  describe('deactivate form', () => {
    beforeEach(() => {
      deepReq.form.options.name = 'deactivate'
      deepReq.sessionModel.get = jest.fn().mockImplementation(
        (key: string) =>
          ({
            deactivationReason: 'OTHER',
            deactivationReasonOther: 'Unidentified energy signature detected',
            facilitiesManagementReference: '12345678',
            mandatoryEstimatedReactivationDate: '2027-01-10',
            workingCapacityExplanation: 'Future cell integrity uncertain',
          })[key],
      )
    })

    describe('generateRequests', () => {
      it('adds DEACTIVATE approval request when form name is deactivate', async () => {
        await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(
          expect.objectContaining({
            approvalType: 'DEACTIVATION',
            deactivatedReason: 'OTHER',
            deactivationReasonDescription: 'Unidentified energy signature detected',
            proposedReactivationDate: '2027-01-10',
            reasonForChange: 'Future cell integrity uncertain',
          }),
        )

        expect(deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]).toEqual(
          expect.objectContaining({
            workingCapacity: 0,
            currentWorkingCapacity: 2,
          }),
        )
      })

      it('does not add DEACTIVATION approval request when form name is not deactivate', async () => {
        deepReq.form.options.name = 'other-form'

        await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(
          deepRes.locals.proposedCertificationApprovalRequests.filter((r: any) => r.approvalType === 'DEACTIVATION'),
        ).toHaveLength(0)
      })
    })

    describe('saveValues', () => {
      beforeEach(() => {
        ;(deepRes.locals as any).locationId = 'loc-123'
        locationsService.deactivateTemporary = jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'req-123' })
      })

      it('deactivates the cell', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(locationsService.deactivateTemporary).toHaveBeenCalledWith(
          'token',
          'loc-123',
          'OTHER',
          'Unidentified energy signature detected',
          '2027-01-10',
          '12345678',
          true,
          'Future cell integrity uncertain',
        )
      })

      it('sends notifications using pendingApprovalRequestId', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
        expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
          1,
          notifyService,
          ['certificate_reviewer@test.com'],
          'Moorland (HMP & YOI)',
          expect.stringContaining('/MDI/cell-certificate/change-requests/req-123/review'),
          NotificationType.REQUEST_RECEIVED,
          undefined,
          undefined,
          undefined,
          'Joe Submitter',
        )

        expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
          2,
          notifyService,
          ['certificate_administrator@test.com', 'certificate_viewer@test.com'],
          'Moorland (HMP & YOI)',
          expect.stringContaining('/MDI/cell-certificate/change-requests/req-123'),
          NotificationType.REQUEST_SUBMITTED,
          undefined,
          undefined,
          undefined,
          'Joe Submitter',
        )
      })

      it('sets single request flash message and redirects', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepReq.flash).toHaveBeenCalledWith('success', {
          title: 'Change request sent',
          content: 'You have submitted a request to update the cell certificate.',
        })
        expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
      })
    })
  })

  describe('locals', () => {
    it('sets buttonText to Submit for approval', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.buttonText).toBe('Submit for approval')
    })

    it('sets cancelText to Cancel', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.cancelText).toBe('Cancel')
    })
  })

  describe('generateRequests', () => {
    beforeEach(() => {
      deepRes.locals.location = LocationFactory.build({
        id: 'some-uuid',
        prisonId: 'MDI',
        status: 'DRAFT',
        leafLevel: true,
        pathHierarchy: 'A-1-001',
        certification: {
          certifiedNormalAccommodation: 1,
        },
        capacity: {
          maxCapacity: 1,
          workingCapacity: 1,
        },
        cellMark: 'A1-01',
      })
      deepReq.form = {
        options: {
          name: '',
        },
      } as any
    })

    it('adds DRAFT approval request when form name is add-to-certificate', async () => {
      deepReq.form.options.name = 'add-to-certificate'
      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(
        expect.objectContaining({
          approvalType: 'DRAFT',
        }),
      )
    })

    it('does not add DRAFT approval request when form name is not add-to-certificate', async () => {
      deepReq.form.options.name = 'other-form'

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(
        deepRes.locals.proposedCertificationApprovalRequests.filter((r: any) => r.approvalType === 'DRAFT'),
      ).toHaveLength(0)
    })

    it('adds CELL_MARK approval request when form name is change-door-number', async () => {
      deepReq.form.options.name = 'change-door-number'
      deepReq.sessionModel.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'doorNumber') return 'A1-02'
        if (key === 'explanation') return 'Need to change door number'
        return undefined
      })

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(
        expect.objectContaining({
          approvalType: 'CELL_MARK',
          currentCellMark: 'A1-01',
          cellMark: 'A1-02',
          reasonForChange: 'Need to change door number',
        }),
      )
    })

    it('does not add CELL_MARK approval request when form name is not change-door-number', async () => {
      deepReq.form.options.name = 'other-form'

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(
        deepRes.locals.proposedCertificationApprovalRequests.filter((r: any) => r.approvalType === 'CELL_MARK'),
      ).toHaveLength(0)
    })

    it('adds CELL_SANITATION approval request when form name is change-sanitation', async () => {
      deepRes.locals.location = LocationFactory.build({
        id: 'some-uuid',
        prisonId: 'MDI',
        status: 'ACTIVE',
        leafLevel: true,
        pathHierarchy: 'A-1-001',
        certification: {
          certifiedNormalAccommodation: 1,
        },
        capacity: {
          maxCapacity: 1,
          workingCapacity: 1,
        },
        inCellSanitation: false,
      })
      deepReq.form.options.name = 'change-sanitation'
      deepReq.sessionModel.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'inCellSanitation') return 'YES'
        if (key === 'explanation') return 'Adding sanitation facilities'
        return undefined
      })

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(
        expect.objectContaining({
          approvalType: 'CELL_SANITATION',
          currentInCellSanitation: false,
          inCellSanitation: true,
          reasonForChange: 'Adding sanitation facilities',
        }),
      )
    })

    it('does not add CELL_SANITATION approval request when form name is not change-sanitation', async () => {
      deepReq.form.options.name = 'other-form'

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(
        deepRes.locals.proposedCertificationApprovalRequests.filter((r: any) => r.approvalType === 'CELL_SANITATION'),
      ).toHaveLength(0)
    })

    it('adds SIGNED_OP_CAP approval request when proposedSignedOpCapChange exists', async () => {
      deepReq.sessionModel.get = jest.fn().mockReturnValue({
        signedOperationalCapacity: 550,
        reasonForChange: 'New capacity',
        prisonId: 'MDI',
      })

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(
        expect.objectContaining({
          approvalType: 'SIGNED_OP_CAP',
          signedOperationCapacityChange: expect.any(Number),
          reasonForChange: 'New capacity',
        }),
      )
    })

    it('sets correct title for single change request', async () => {
      deepRes.locals.location.status = 'ACTIVE'
      deepReq.sessionModel.get = jest.fn().mockReturnValue(undefined)

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.title).toBe('You are requesting a change to the cell certificate')
    })

    it('sets correct title for multiple change requests', async () => {
      deepReq.form.options.name = 'add-to-certificate'
      deepReq.sessionModel.get = jest.fn().mockReturnValue({
        signedOperationalCapacity: 550,
        reasonForChange: 'New capacity',
        prisonId: 'MDI',
      })

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.title).toContain('2 changes')
    })

    it('calls next when complete', async () => {
      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('locationToCertificationLocation - pendingChanges handling', () => {
    const createBaseLocation = (pendingChanges?: any) => ({
      id: 'loc-uuid',
      code: 'A1',
      pathHierarchy: 'A-1-001',
      level: 1,
      locationType: 'Cell',
      leafLevel: true,
      prisonId: 'MDI',
      status: 'ACTIVE',
      certification: {
        certifiedNormalAccommodation: 1,
      },
      capacity: {
        maxCapacity: 1,
        workingCapacity: 1,
      },
      inCellSanitation: true,
      cellMark: 'A1-01',
      specialistCellTypes: ['SAFE_CUSTODY'],
      accommodationTypes: ['SINGLE'],
      usedFor: ['GENERAL_USE'],
      parentId: 'parent-uuid',
      ...(pendingChanges && { pendingChanges }),
    })

    beforeEach(() => {
      deepReq.form = {
        options: {
          name: 'change-door-number',
        },
      } as any
      deepReq.sessionModel.get = jest.fn().mockReturnValue(undefined)
    })

    it('uses pendingChanges.certifiedNormalAccommodation when defined', async () => {
      deepRes.locals.location = createBaseLocation({ certifiedNormalAccommodation: 2 }) as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.certifiedNormalAccommodation).toBe(2)
    })

    it('uses current certification.certifiedNormalAccommodation when pendingChanges is undefined', async () => {
      deepRes.locals.location = createBaseLocation() as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.certifiedNormalAccommodation).toBe(1)
    })

    it('uses pendingChanges.maxCapacity when defined', async () => {
      deepRes.locals.location = createBaseLocation({ maxCapacity: 5 }) as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.maxCapacity).toBe(5)
    })

    it('uses current capacity.maxCapacity when pendingChanges is undefined', async () => {
      deepRes.locals.location = createBaseLocation() as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.maxCapacity).toBe(1)
    })

    it('uses pendingChanges.workingCapacity when defined', async () => {
      deepRes.locals.location = createBaseLocation({ workingCapacity: 3 }) as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.workingCapacity).toBe(3)
    })

    it('uses current capacity.workingCapacity when pendingChanges is undefined', async () => {
      deepRes.locals.location = createBaseLocation() as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.workingCapacity).toBe(1)
    })

    it('uses all pendingChanges when all are defined', async () => {
      deepRes.locals.location = createBaseLocation({
        certifiedNormalAccommodation: 2,
        maxCapacity: 5,
        workingCapacity: 3,
      }) as any

      await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

      const certLocation = deepRes.locals.proposedCertificationApprovalRequests[0].locations[0]
      expect(certLocation.certifiedNormalAccommodation).toBe(2)
      expect(certLocation.maxCapacity).toBe(5)
      expect(certLocation.workingCapacity).toBe(3)
    })
  })
})
