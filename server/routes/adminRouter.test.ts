import type { Express } from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'
import PrisonService from '../services/prisonService'
import paths from '../utils/paths'
import ManageUsersService from '../services/manageUsersService'

jest.mock('../services/auditService')
jest.mock('../services/authService')
jest.mock('../services/locationsService')
jest.mock('../services/prisonService')
jest.mock('../services/manageUsersService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>

let app: Express

const adminUser = {
  ...user,
  userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'],
}

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      authService,
      locationsService,
      prisonService,
      manageUsersService,
    },
    userSupplier: () => adminUser,
  })
  authService.getSystemClientToken.mockResolvedValue('token')
  manageUsersService.getCaseloads.mockResolvedValue([{ id: 'TST', name: 'Test' }])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /PRISON_ID/admin', () => {
  it('should render the admin index page', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    prisonService.getScreenStatus.mockResolvedValue({
      conditionType: 'CASELOAD',
      conditionValue: 'TST',
      blockAccess: true,
    })
    return request(app)
      .get(paths.admin.index('TST'))
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // check links
        expect(res.text).toContain(paths.admin.changeResidentialStatus('TST'))
        expect(res.text).toContain(paths.admin.changeCertificationStatus('TST'))
        expect(res.text).toContain(paths.admin.changeIncludeSegInRollCount('TST'))
        expect(res.text).not.toContain('change-non-resi-status')
        expect(res.text).not.toContain('change-nomis-screen-status')
        expect(res.text).not.toContain('Prison non housing checkboxes')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOCATION_ADMIN, {
          who: user.username,
          correlationId: expect.any(String),
          details: { userUuid: user.userUuid },
        })
      })
  })

  describe('OIMMHOLO screen status', () => {
    const notFound: SanitisedError<object> = new Error('Not Found')
    notFound.responseStatus = 404

    const conditions = (blockAccessByValue: Record<string, boolean>) =>
      prisonService.getScreenStatus.mockImplementation(async (_token, conditionValue) => {
        if (conditionValue in blockAccessByValue) {
          return { conditionType: 'CASELOAD', conditionValue, blockAccess: blockAccessByValue[conditionValue] }
        }
        throw notFound
      })

    beforeEach(() => {
      auditService.logPageView.mockResolvedValue(null)
      locationsService.getPrisonConfiguration.mockResolvedValue({
        prisonId: 'TST',
        resiLocationServiceActive: 'ACTIVE',
        nonResiServiceActive: 'ACTIVE',
        includeSegregationInRollCount: 'INACTIVE',
        certificationApprovalRequired: 'INACTIVE',
      })
    })

    const lookups = () => prisonService.getScreenStatus.mock.calls.map(args => args[1])

    it('uses the **ALL** condition over the prison condition when both exist', async () => {
      conditions({ '**ALL**': true, TST: false })

      const res = await request(app).get(paths.admin.index('TST')).expect(200)

      expect(lookups()).toEqual(['**ALL**'])
      expect(res.text).toContain('Blocked')
      expect(res.text).not.toContain('Not-Blocked')
    })

    it('shows not blocked when **ALL** is not blocked, even if the prison condition is blocked', async () => {
      conditions({ '**ALL**': false, TST: true })

      const res = await request(app).get(paths.admin.index('TST')).expect(200)

      expect(lookups()).toEqual(['**ALL**'])
      expect(res.text).toContain('Not-Blocked')
    })

    it('uses the prison condition when there is no **ALL** condition', async () => {
      conditions({ TST: true })

      const res = await request(app).get(paths.admin.index('TST')).expect(200)

      expect(lookups()).toEqual(['**ALL**', 'TST'])
      expect(res.text).toContain('Blocked')
      expect(res.text).not.toContain('Not-Blocked')
    })

    it('shows not blocked when there is no **ALL** or prison condition', async () => {
      conditions({})

      const res = await request(app).get(paths.admin.index('TST')).expect(200)

      expect(lookups()).toEqual(['**ALL**', 'TST'])
      expect(res.text).toContain('Not-Blocked')
    })
  })
})
