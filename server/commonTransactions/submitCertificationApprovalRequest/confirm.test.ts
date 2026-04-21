import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ManageUsersService from '../../services/manageUsersService'
import NotificationService, { NotificationType, notificationGroups } from '../../services/notificationService'
import LocationsService from '../../services/locationsService'
import Confirm from './confirm'
import * as notificationHelpers from '../../utils/notificationHelpers'
import LocationFactory from '../../testutils/factories/location'
import { CertificationApprovalRequest } from '../../data/types/locationsApi/certificationApprovalRequest'
import CertificationApprovalRequestFactory from '../../testutils/factories/certificationApprovalRequest'
import CertificateLocationFactory from '../../testutils/factories/certificateLocation'
import mockModel from '../../testutils/mockModel'
import LocationResidentialSummaryFactory from '../../testutils/factories/locationResidentialSummary'

jest.mock('../../utils/notificationHelpers')
jest.mock('../../middleware/getPrisonResidentialSummary')
jest.mock('../../middleware/populateLocation')

describe('Confirm', () => {
  const controller = new Confirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = {
    getAccommodationTypes: jest.fn().mockResolvedValue([]),
    getLocation: jest.fn(),
    getSpecialistCellTypes: jest.fn().mockResolvedValue([]),
    getUsedForTypes: jest.fn().mockResolvedValue([]),
    getResidentialSummary: jest.fn().mockResolvedValue({
      subLocations: [],
    } as any),
    createCertificationRequestForSignedOpCap: jest.fn().mockResolvedValue({ id: 'SIGNED_OP_CAP-id' } as any),
    createCertificationRequestForLocation: jest.fn().mockImplementation((_token, type) => ({ id: `${type}-id` })),
    updateCellSanitation: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'CELL_SANITATION-id' } as any),
    updateCellMark: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'CELL_MARK-id' } as any),
    requestReactivation: jest.fn().mockResolvedValue({ id: 'REACTIVATION-id' } as any),
    deactivateTemporary: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'DEACTIVATION-id' } as any),
  } as unknown as jest.Mocked<LocationsService>
  const manageUsersService = {} as jest.Mocked<ManageUsersService>
  const notifyService = {} as jest.Mocked<NotificationService>

  const approvalTypesData: {
    approvalRequestData: DeepPartial<CertificationApprovalRequest>
    beforeGenerateRequests: (approvalRequestData: DeepPartial<CertificationApprovalRequest>) => void
    checkSaveValues: (approvalRequestData: DeepPartial<CertificationApprovalRequest>) => void
  }[] = [
    {
      approvalRequestData: {
        approvalType: 'SIGNED_OP_CAP',
        prisonId: 'MDI',
        currentSignedOperationCapacity: 200,
        signedOperationCapacityChange: 50,
        reasonForChange: 'New location built',
      },
      beforeGenerateRequests: approvalRequestData => {
        deepReq.form.options.name = 'other-form'
        deepReq.sessionModel.set('proposedSignedOpCapChange', {
          prisonId: approvalRequestData.prisonId,
          signedOperationalCapacity:
            approvalRequestData.currentSignedOperationCapacity + approvalRequestData.signedOperationCapacityChange,
          reasonForChange: approvalRequestData.reasonForChange,
        })
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.createCertificationRequestForSignedOpCap).toHaveBeenCalledWith(
          'token',
          approvalRequestData.prisonId,
          approvalRequestData.currentSignedOperationCapacity + approvalRequestData.signedOperationCapacityChange,
          approvalRequestData.reasonForChange,
        ),
    },
    {
      approvalRequestData: {
        approvalType: 'DRAFT',
        locationId: 'draftLocationId',
        prisonId: 'MDI',
        locations: [
          CertificateLocationFactory.build({
            id: 'draftLocationId',
            locationType: 'WING',
            pathHierarchy: 'A',
            locationCode: 'A',
            cellMark: undefined,
            currentCellMark: undefined,
            inCellSanitation: false,
            level: 1,
            subLocations: [
              CertificateLocationFactory.build({
                id: 'draftLocationId-1',
                locationType: 'LANDING',
                pathHierarchy: 'A-1',
                locationCode: '1',
                cellMark: undefined,
                currentCellMark: undefined,
                inCellSanitation: false,
                level: 2,
                subLocations: [
                  CertificateLocationFactory.build({
                    id: 'draftLocationId-1-001',
                    locationType: 'CELL',
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      beforeGenerateRequests: _approvalRequestData => {
        deepReq.form.options.name = 'add-to-certificate'
        const wing = LocationFactory.build({
          id: 'draftLocationId',
          locationType: 'WING',
          pathHierarchy: 'A',
          code: 'A',
          status: 'DRAFT',
          cellMark: undefined,
          level: 1,
          inCellSanitation: false,
          currentCellCertificate: undefined,
          leafLevel: false,
        })
        const landing = LocationFactory.build({
          parentId: wing.id,
          id: 'draftLocationId-1',
          locationType: 'LANDING',
          pathHierarchy: 'A-1',
          code: '1',
          status: 'DRAFT',
          cellMark: undefined,
          level: 2,
          inCellSanitation: false,
          currentCellCertificate: undefined,
          leafLevel: false,
        })
        const cell = LocationFactory.build({
          parentId: landing.id,
          id: 'draftLocationId-1-001',
          locationType: 'CELL',
          status: 'DRAFT',
          cellMark: 'A1-1',
          level: 3,
          inCellSanitation: true,
          currentCellCertificate: undefined,
        })
        deepRes.locals.location = wing
        locationsService.getResidentialSummary
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: wing,
              subLocations: [landing],
            }),
          )
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: landing,
              subLocations: [cell],
            }),
          )
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: cell,
              subLocations: [],
            }),
          )
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.createCertificationRequestForLocation).toHaveBeenCalledWith(
          'token',
          'DRAFT',
          approvalRequestData.locationId,
        ),
    },
    {
      approvalRequestData: {
        approvalType: 'DEACTIVATION',
        deactivatedReason: 'OTHER',
        deactivationReasonDescription: 'Unidentified energy signature detected',
        locationId: 'deactivationLocationId',
        locationKey: 'TST-A-1-001',
        locations: [
          CertificateLocationFactory.build({
            id: 'deactivationLocationId',
            workingCapacity: 0,
          }),
        ],
        planetFmReference: '12345678',
        prisonId: 'MDI',
        proposedReactivationDate: '2027-01-10',
        reasonForChange: 'Future cell integrity uncertain',
        workingCapacityChange: -2,
      },
      beforeGenerateRequests: approvalRequestData => {
        deepReq.form.options.name = 'deactivate'
        deepReq.sessionModel.set('deactivationReason', approvalRequestData.deactivatedReason)
        deepReq.sessionModel.set('deactivationReasonOther', approvalRequestData.deactivationReasonDescription)
        deepReq.sessionModel.set('facilitiesManagementReference', approvalRequestData.planetFmReference)
        deepReq.sessionModel.set('mandatoryEstimatedReactivationDate', approvalRequestData.proposedReactivationDate)
        deepReq.sessionModel.set('workingCapacityExplanation', approvalRequestData.reasonForChange)
        const certLocation = approvalRequestData.locations[0]
        const location = LocationFactory.build({
          id: 'deactivationLocationId',
          currentCellCertificate: { ...certLocation, workingCapacity: certLocation.currentWorkingCapacity },
        })
        deepRes.locals.location = location
        locationsService.getLocation.mockResolvedValueOnce(location)
        locationsService.getResidentialSummary.mockResolvedValueOnce(
          LocationResidentialSummaryFactory.build({
            parentLocation: location,
            subLocations: [],
          }),
        )
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.deactivateTemporary).toHaveBeenCalledWith(
          'token',
          approvalRequestData.locationId,
          approvalRequestData.deactivatedReason,
          approvalRequestData.deactivationReasonDescription,
          approvalRequestData.proposedReactivationDate,
          approvalRequestData.planetFmReference,
          true,
          approvalRequestData.reasonForChange,
        ),
    },
    {
      approvalRequestData: {
        approvalType: 'CELL_MARK',
        locationId: 'cellMarkLocationId',
        locationKey: 'TST-A-1-001',
        currentCellMark: 'A1-1',
        cellMark: 'A1-02',
        reasonForChange: 'Need to change door number',
        locations: [
          CertificateLocationFactory.build({
            id: 'cellMarkLocationId',
          }),
        ],
      },
      beforeGenerateRequests: approvalRequestData => {
        deepReq.form.options.name = 'change-door-number'
        deepReq.sessionModel.set('doorNumber', approvalRequestData.cellMark)
        deepReq.sessionModel.set('explanation', approvalRequestData.reasonForChange)
        const certLocation = approvalRequestData.locations[0]
        const location = LocationFactory.build({ id: 'cellMarkLocationId', currentCellCertificate: certLocation })
        deepRes.locals.location = location
        locationsService.getLocation.mockResolvedValueOnce(location)
        locationsService.getResidentialSummary.mockResolvedValueOnce(
          LocationResidentialSummaryFactory.build({
            parentLocation: location,
            subLocations: [],
          }),
        )
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.updateCellMark).toHaveBeenCalledWith('token', approvalRequestData.locationId, {
          cellMark: approvalRequestData.cellMark,
          reasonForChange: approvalRequestData.reasonForChange,
        }),
    },
    {
      approvalRequestData: {
        approvalType: 'CELL_SANITATION',
        locationId: 'cellSanitationLocationId',
        locationKey: 'TST-A-1-001',
        currentInCellSanitation: true,
        inCellSanitation: false,
        reasonForChange: 'Toilet vanished',
        locations: [
          CertificateLocationFactory.build({
            id: 'cellSanitationLocationId',
          }),
        ],
      },
      beforeGenerateRequests: approvalRequestData => {
        deepReq.form.options.name = 'change-sanitation'
        deepReq.sessionModel.set('inCellSanitation', 'NO')
        deepReq.sessionModel.set('explanation', approvalRequestData.reasonForChange)
        const certLocation = approvalRequestData.locations[0]
        const location = LocationFactory.build({ id: 'cellSanitationLocationId', currentCellCertificate: certLocation })
        deepRes.locals.location = location
        locationsService.getResidentialSummary.mockResolvedValueOnce(
          LocationResidentialSummaryFactory.build({
            parentLocation: location,
            subLocations: [],
          }),
        )
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.updateCellSanitation).toHaveBeenCalledWith('token', approvalRequestData.locationId, {
          inCellSanitation: approvalRequestData.inCellSanitation,
          reasonForChange: approvalRequestData.reasonForChange,
        }),
    },
    {
      approvalRequestData: {
        prisonId: 'MDI',
        locationKey: 'TST-A-1-001',
        approvalType: 'REACTIVATION',
        locationId: 'reactivationLocationId',
        certifiedNormalAccommodationChange: 1,
        workingCapacityChange: 1,
        maxCapacityChange: 2,
        locations: [
          CertificateLocationFactory.build({
            id: 'reactivationLocationId',
            locationType: 'WING',
            certifiedNormalAccommodation: 3,
            workingCapacity: 3,
            maxCapacity: 4,
            currentCellMark: undefined,
            cellMark: undefined,
            inCellSanitation: false,
            level: 1,
            subLocations: [
              CertificateLocationFactory.build({
                id: 'reactivationLocationId-1',
                locationType: 'LANDING',
                currentCellMark: undefined,
                cellMark: undefined,
                inCellSanitation: false,
                level: 2,
                subLocations: [
                  CertificateLocationFactory.build({
                    id: 'reactivationLocationId-1-1',
                    specialistCellTypes: [],
                    certifiedNormalAccommodation: 3,
                    workingCapacity: 3,
                    maxCapacity: 4,
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      beforeGenerateRequests: approvalRequestData => {
        const certWing = approvalRequestData.locations[0]
        const wing = LocationFactory.build({
          id: 'reactivationLocationId',
          locationType: 'WING',
          cellMark: undefined,
          level: 1,
          inCellSanitation: false,
          currentCellCertificate: {
            ...certWing,
            workingCapacity: certWing.currentWorkingCapacity,
            certifiedNormalAccommodation: certWing.currentCertifiedNormalAccommodation,
            maxCapacity: certWing.currentMaxCapacity,
            specialistCellTypes: certWing.currentSpecialistCellTypes,
          },
        })
        const certLanding = certWing.subLocations[0]
        const landing = LocationFactory.build({
          parentId: wing.id,
          id: 'reactivationLocationId-1',
          locationType: 'LANDING',
          cellMark: undefined,
          level: 2,
          inCellSanitation: false,
          currentCellCertificate: {
            ...certLanding,
            workingCapacity: certLanding.currentWorkingCapacity,
            certifiedNormalAccommodation: certLanding.currentCertifiedNormalAccommodation,
            maxCapacity: certLanding.currentMaxCapacity,
            specialistCellTypes: certLanding.currentSpecialistCellTypes,
          },
        })
        const certCell = certLanding.subLocations[0]
        const cell = LocationFactory.build({
          parentId: landing.id,
          id: 'reactivationLocationId-1-1',
          locationType: 'CELL',
          cellMark: 'A1-1',
          level: 3,
          inCellSanitation: true,
          currentCellCertificate: {
            ...certCell,
            workingCapacity: certCell.currentWorkingCapacity,
            certifiedNormalAccommodation: certCell.currentCertifiedNormalAccommodation,
            maxCapacity: certCell.currentMaxCapacity,
            specialistCellTypes: certCell.currentSpecialistCellTypes,
          },
        })
        deepRes.locals.location = wing
        locationsService.getResidentialSummary
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: wing,
              subLocations: [landing],
            }),
          )
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: landing,
              subLocations: [cell],
            }),
          )
          .mockResolvedValueOnce(
            LocationResidentialSummaryFactory.build({
              parentLocation: cell,
              subLocations: [],
            }),
          )
        deepReq.form.options.name = 'reactivate'
        deepReq.sessionModel.set('baselineCna-reactivationLocationId-1-1', '3')
        deepReq.sessionModel.set('workingCapacity-reactivationLocationId-1-1', '3')
        deepReq.sessionModel.set('maximumCapacity-reactivationLocationId-1-1', '4')
        deepReq.sessionModel.set('saved-cellTypesreactivationLocationId-1-1-removed', true)
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.requestReactivation).toHaveBeenCalledWith('token', {
          cellReactivationChanges: {
            'reactivationLocationId-1-1': {
              capacity: { certifiedNormalAccommodation: 3, maxCapacity: 4, workingCapacity: 3 },
              specialistCellTypes: [],
            },
          },
          topLevelLocationId: approvalRequestData.locationId,
        }),
    },
  ]

  beforeEach(() => {
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
      sessionModel: mockModel(),
      journeyModel: mockModel(),
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
    ;(notificationHelpers.getUserEmails as jest.Mock).mockImplementation(
      (_manageUsersService: any, _systemToken: string, _prisonId: string, roles: string[]) => {
        const emails = []

        if (roles.includes('RESI__CERT_REVIEWER')) {
          emails.push('certificate_reviewer@test.com')
        }

        if (roles.includes('MANAGE_RES_LOCATIONS_OP_CAP')) {
          emails.push('certificate_administrator@test.com')
        }

        if (roles.includes('RESI__CERT_VIEWER')) {
          emails.push('certificate_viewer@test.com')
        }

        return emails
      },
    )
    ;(notificationHelpers.sendNotification as jest.Mock).mockResolvedValue(undefined)
  })

  describe('individual types', () => {
    approvalTypesData.forEach(({ approvalRequestData, beforeGenerateRequests, checkSaveValues }) => {
      const approvalRequest = CertificationApprovalRequestFactory.build(approvalRequestData)

      describe(approvalRequest.approvalType, () => {
        describe('generateRequests', () => {
          beforeEach(() => beforeGenerateRequests(approvalRequestData))

          it('generates the expected proposed approval request', async () => {
            await controller.generateRequests(deepReq as FormWizard.Request, deepRes as Response, next)

            expect(deepRes.locals.proposedCertificationApprovalRequests.length).toEqual(1)
            expect(deepRes.locals.proposedCertificationApprovalRequests).toContainEqual(approvalRequestData)
          })
        })

        describe('saveValues', () => {
          beforeEach(() => {
            deepRes.locals.proposedCertificationApprovalRequests = [approvalRequest]
          })

          it('creates certification request, sets flash message and redirects', async () => {
            await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

            checkSaveValues(approvalRequestData)

            expect(deepReq.flash).toHaveBeenCalledWith('success', {
              title: 'Change request sent',
              content: 'You have submitted a request to update the cell certificate.',
            })

            expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
          })
        })
      })
    })
  })

  describe('saveValues - when creating every type of request', () => {
    beforeEach(() => {
      deepRes.locals.proposedCertificationApprovalRequests = approvalTypesData.map(d =>
        CertificationApprovalRequestFactory.build(d.approvalRequestData),
      )
    })

    it('sends out emails for all of the individual requests, sets flash message and redirects', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      for (let i = 0; i < deepRes.locals.proposedCertificationApprovalRequests.length; i += 1) {
        const approvalRequest = deepRes.locals.proposedCertificationApprovalRequests[i]

        expect(notificationHelpers.getUserEmails).toHaveBeenNthCalledWith(
          i * 2 + 1,
          manageUsersService,
          'token',
          'MDI',
          notificationGroups.requestReceivedUsers,
        )
        expect(notificationHelpers.getUserEmails).toHaveBeenNthCalledWith(
          i * 2 + 2,
          manageUsersService,
          'token',
          'MDI',
          notificationGroups.requestSubmittedUsers,
        )

        expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
          i * 2 + 1,
          notifyService,
          ['certificate_reviewer@test.com'],
          'Moorland (HMP & YOI)',
          expect.stringContaining(`/MDI/cell-certificate/change-requests/${approvalRequest.approvalType}-id/review`),
          NotificationType.REQUEST_RECEIVED,
          undefined,
          undefined,
          undefined,
          'Joe Submitter',
        )
        expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
          i * 2 + 2,
          notifyService,
          ['certificate_administrator@test.com', 'certificate_viewer@test.com'],
          'Moorland (HMP & YOI)',
          expect.stringContaining(`/MDI/cell-certificate/change-requests/${approvalRequest.approvalType}-id`),
          NotificationType.REQUEST_SUBMITTED,
          undefined,
          undefined,
          undefined,
          'Joe Submitter',
        )
      }

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change requests sent',
        content: `You have submitted ${deepRes.locals.proposedCertificationApprovalRequests.length} requests to update the cell certificate.`,
      })

      expect(deepRes.redirect).toHaveBeenCalledWith('/MDI/cell-certificate/change-requests')
    })
  })

  describe('locals', () => {
    it('sets buttonText to Submit for approval', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.buttonText).toBe('Submit for approval')
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
        capacity: {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
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

      expect(deepRes.locals.proposedCertificationApprovalRequests.map(d => d.approvalType)).toEqual(['DRAFT'])
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
        capacity: {
          certifiedNormalAccommodation: 1,
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
})
