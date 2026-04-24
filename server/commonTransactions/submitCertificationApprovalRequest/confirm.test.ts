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
  let locationsService: jest.Mocked<LocationsService>
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
        prisonId: 'TST',
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
        prisonId: 'TST',
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
          leafLevel: false,
          inCellSanitation: false,
          currentCellCertificate: undefined,
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
          leafLevel: false,
          inCellSanitation: false,
          currentCellCertificate: undefined,
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
        locationsService.getResidentialSummary.mockImplementation((_token, _prisonId, id) =>
          Promise.resolve(
            {
              [wing.id]: LocationResidentialSummaryFactory.build({
                parentLocation: wing,
                subLocations: [landing],
              }),
              [landing.id]: LocationResidentialSummaryFactory.build({
                parentLocation: landing,
                subLocations: [cell],
              }),
              [cell.id]: LocationResidentialSummaryFactory.build({
                parentLocation: cell,
                subLocations: [],
              }),
            }[id],
          ),
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
        prisonId: 'TST',
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
        prisonId: 'TST',
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
        prisonId: 'TST',
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
        locationsService.getLocation.mockResolvedValueOnce(location)
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.updateCellSanitation).toHaveBeenCalledWith('token', approvalRequestData.locationId, {
          inCellSanitation: approvalRequestData.inCellSanitation,
          reasonForChange: approvalRequestData.reasonForChange,
        }),
    },
    {
      approvalRequestData: {
        prisonId: 'TST',
        locationKey: 'TST-A',
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
          leafLevel: false,
          inCellSanitation: false,
          key: 'TST-A',
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
          leafLevel: false,
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
        locationsService.getResidentialSummary.mockImplementation((_token, _prisonId, id) =>
          Promise.resolve(
            {
              [wing.id]: LocationResidentialSummaryFactory.build({
                parentLocation: wing,
                subLocations: [landing],
              }),
              [landing.id]: LocationResidentialSummaryFactory.build({
                parentLocation: landing,
                subLocations: [cell],
              }),
              [cell.id]: LocationResidentialSummaryFactory.build({
                parentLocation: cell,
                subLocations: [],
              }),
            }[id],
          ),
        )
        locationsService.getLocation.mockResolvedValueOnce(cell)
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
    {
      approvalRequestData: {
        prisonId: 'TST',
        locationKey: 'TST-A-1-001',
        approvalType: 'CAPACITY_CHANGE',
        locationId: 'workingCapacityMismatchId-1-1',
        workingCapacityChange: 1,
        locations: [
          CertificateLocationFactory.build({
            id: 'workingCapacityMismatchId-1-1',
            locationType: 'CELL',
            currentWorkingCapacity: 1,
          }),
        ],
      },
      beforeGenerateRequests: approvalRequestData => {
        const certCell = approvalRequestData.locations[0]
        const cell = LocationFactory.build({
          parentId: 'workingCapacityMismatchId-1',
          id: certCell.id,
          currentCellCertificate: {
            ...certCell,
            workingCapacity: 1,
          },
        })
        deepRes.locals.location = cell
        locationsService.getLocation.mockResolvedValueOnce(cell)
        deepReq.form.options.name = 'working-capacity-mismatch'
      },
      checkSaveValues: approvalRequestData =>
        expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', approvalRequestData.locationId, {
          certifiedNormalAccommodation: 2,
          maxCapacity: 2,
          workingCapacity: 2,
          reasonForChange: null,
        }),
    },
  ]

  beforeEach(() => {
    locationsService = {
      getAccommodationTypes: jest.fn().mockResolvedValue([]),
      getLocation: jest.fn(),
      getSpecialistCellTypes: jest.fn().mockResolvedValue([]),
      getUsedForTypes: jest.fn().mockResolvedValue([]),
      getResidentialSummary: jest.fn().mockResolvedValue({
        subLocations: [],
      } as any),
      createCertificationRequestForSignedOpCap: jest.fn().mockResolvedValue({ id: 'SIGNED_OP_CAP-id' } as any),
      createCertificationRequestForLocation: jest.fn().mockImplementation((_token, type) => ({ id: `${type}-id` })),
      updateCapacity: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'CAPACITY_CHANGE-id' } as any),
      updateCellSanitation: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'CELL_SANITATION-id' } as any),
      updateCellMark: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'CELL_MARK-id' } as any),
      requestReactivation: jest.fn().mockResolvedValue({ id: 'REACTIVATION-id' } as any),
      deactivateTemporary: jest.fn().mockResolvedValue({ pendingApprovalRequestId: 'DEACTIVATION-id' } as any),
    } as unknown as jest.Mocked<LocationsService>
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
          prisonId: 'TST',
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
        prisonId: 'TST',
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

            expect(deepRes.redirect).toHaveBeenCalledWith('/TST/cell-certificate/change-requests')
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
          'TST',
          notificationGroups.requestReceivedUsers,
        )
        expect(notificationHelpers.getUserEmails).toHaveBeenNthCalledWith(
          i * 2 + 2,
          manageUsersService,
          'token',
          'TST',
          notificationGroups.requestSubmittedUsers,
        )

        expect(notificationHelpers.sendNotification).toHaveBeenNthCalledWith(
          i * 2 + 1,
          notifyService,
          ['certificate_reviewer@test.com'],
          'Moorland (HMP & YOI)',
          expect.stringContaining(`/TST/cell-certificate/change-requests/${approvalRequest.approvalType}-id/review`),
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
          expect.stringContaining(`/TST/cell-certificate/change-requests/${approvalRequest.approvalType}-id`),
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

      expect(deepRes.redirect).toHaveBeenCalledWith('/TST/cell-certificate/change-requests')
    })
  })

  describe('locals', () => {
    it('sets buttonText to Submit for approval', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.buttonText).toBe('Submit for approval')
    })
  })
})
