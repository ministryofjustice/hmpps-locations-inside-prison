import type { Express } from 'express'
import request from 'supertest'

import { PrisonConfiguration } from '../data/types/locationsApi'
import AnalyticsService from '../services/analyticsService'
import AuditService from '../services/auditService'
import LocationsService from '../services/locationsService'
import PrisonService from '../services/prisonService'
import { appWithAllRoutes, flashProvider, user } from './testutils/appSetup'

jest.mock('../services/analyticsService')
jest.mock('../services/auditService')
jest.mock('../services/locationsService')
jest.mock('../services/prisonService')

const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
const auditService = new AuditService(null) as jest.Mocked<AuditService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
const adminUser = { ...user, userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'] }

const configuration = (
  prisonId: string,
  prisonName: string,
  resiLocationServiceActive: string,
  certificationApprovalRequired: string,
): PrisonConfiguration => ({
  prisonId,
  prisonName,
  resiLocationServiceActive,
  nonResiServiceActive: 'ACTIVE',
  includeSegregationInRollCount: 'INACTIVE',
  certificationApprovalRequired,
})

let app: Express

const createApp = (userRoles: string[]) =>
  appWithAllRoutes({
    services: { analyticsService, auditService, locationsService, prisonService },
    userSupplier: () => ({ ...adminUser, userRoles }),
  })

beforeEach(() => {
  app = createApp(adminUser.userRoles)
  auditService.logPageView.mockResolvedValue(null)
  auditService.logAuditEvent.mockResolvedValue(null)
  locationsService.getAllPrisonConfigurations.mockResolvedValue([
    configuration('BXI', 'Brixton (HMP)', 'INACTIVE', 'INACTIVE'),
    configuration('LEI', 'Leeds (HMP)', 'ACTIVE', 'ACTIVE'),
    configuration('MDI', 'Moorland (HMP & YOI)', 'ACTIVE', 'INACTIVE'),
  ])
  flashProvider.mockReturnValue([])
})

afterEach(() => jest.resetAllMocks())

describe('GET /prison-configuration', () => {
  it('lists every prison with its MVP1 and certification status', async () => {
    const res = await request(app).get('/prison-configuration').expect(200)

    expect(res.text).toContain('MVP1 is switched on for 2 of 3 prisons.')
    expect(res.text).toContain('Certification is switched on for\n      1 of 3 prisons.')
    expect(res.text).toContain('data-qa="name-BXI"')
    expect(res.text).toContain('Moorland (HMP &amp; YOI)')
    expect(res.text).toContain('action="/prison-configuration/BXI/residential"')
    expect(res.text).toContain('action="/prison-configuration/LEI/certification"')
    expect(res.text).toMatch(/data-qa="residential-toggle-BXI"[^>]*>\s*Turn on/)
    expect(res.text).toMatch(/data-qa="residential-toggle-LEI"[^>]*>\s*Turn off/)
    expect(res.text).toMatch(/data-qa="certification-toggle-MDI"[^>]*>\s*Turn on/)
    expect(res.text).not.toContain('seg in roll count')
    expect(locationsService.getAllPrisonConfigurations).toHaveBeenCalledWith(undefined)
  })

  it('filters by prison name or ID', async () => {
    const byName = await request(app).get('/prison-configuration?q=leeds').expect(200)
    expect(byName.text).toContain('data-qa="name-LEI"')
    expect(byName.text).not.toContain('data-qa="name-BXI"')

    const byId = await request(app).get('/prison-configuration?q=mdi').expect(200)
    expect(byId.text).toContain('data-qa="name-MDI"')
    expect(byId.text).not.toContain('data-qa="name-LEI"')
  })

  it('says when nothing matches the search', async () => {
    const res = await request(app).get('/prison-configuration?q=nowhere').expect(200)

    expect(res.text).toContain('No prisons match your search.')
  })

  it('is not available without the administrator role', async () => {
    app = createApp([])

    await request(app).get('/prison-configuration').expect(403)
    expect(locationsService.getAllPrisonConfigurations).not.toHaveBeenCalled()
  })
})

describe('POST /prison-configuration/:prisonId/:setting', () => {
  it('switches MVP1 on and blocks the NOMIS screen', async () => {
    prisonService.getScreenStatus.mockResolvedValue({} as never)

    await request(app)
      .post('/prison-configuration/BXI/residential')
      .send({ status: 'ACTIVE', name: 'Brixton (HMP)', q: 'brix' })
      .expect(302)
      .expect('Location', '/prison-configuration?q=brix')

    expect(locationsService.updateResiStatus).toHaveBeenCalledWith(undefined, 'BXI', 'ACTIVE')
    expect(prisonService.updateScreen).toHaveBeenCalledWith(undefined, 'BXI', true)
    expect(prisonService.addCondition).not.toHaveBeenCalled()
    expect(analyticsService.sendEvent).toHaveBeenCalledWith(expect.anything(), 'resi_status', {
      prison_id: 'BXI',
      status: 'ACTIVE',
    })
    expect(auditService.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        what: 'SET_RESIDENTIAL_SERVICE_STATUS',
        who: user.username,
        subjectId: 'BXI',
        details: { status: 'ACTIVE' },
      }),
    )
    expect(flashProvider).toHaveBeenCalledWith('success', {
      title: 'MVP1 switched on',
      content: 'MVP1 is now switched on for Brixton (HMP).',
    })
  })

  it('adds the NOMIS screen condition when the prison does not have one yet', async () => {
    prisonService.getScreenStatus.mockRejectedValue({ responseStatus: 404 })

    await request(app).post('/prison-configuration/BXI/residential').send({ status: 'ACTIVE' }).expect(302)

    expect(prisonService.addCondition).toHaveBeenCalledWith(undefined, 'BXI', true)
    expect(prisonService.updateScreen).not.toHaveBeenCalled()
  })

  it('switches MVP1 off and unblocks the NOMIS screen', async () => {
    prisonService.getScreenStatus.mockResolvedValue({} as never)

    await request(app)
      .post('/prison-configuration/LEI/residential')
      .send({ status: 'INACTIVE', name: 'Leeds (HMP)' })
      .expect(302)
      .expect('Location', '/prison-configuration')

    expect(locationsService.updateResiStatus).toHaveBeenCalledWith(undefined, 'LEI', 'INACTIVE')
    expect(prisonService.updateScreen).toHaveBeenCalledWith(undefined, 'LEI', false)
  })

  it('says so when the NOMIS screen cannot be changed', async () => {
    prisonService.getScreenStatus.mockRejectedValue({ responseStatus: 500 })

    await request(app)
      .post('/prison-configuration/BXI/residential')
      .send({ status: 'ACTIVE', name: 'Brixton (HMP)' })
      .expect(302)
      .expect('Location', '/prison-configuration')

    expect(locationsService.updateResiStatus).toHaveBeenCalledWith(undefined, 'BXI', 'ACTIVE')
    expect(flashProvider).toHaveBeenCalledWith('error', {
      title: 'MVP1 is switched on for Brixton (HMP)',
      content: 'The NOMIS residential screen could not be blocked. Switch MVP1 off and on again to retry.',
    })
    expect(flashProvider).not.toHaveBeenCalledWith('success', expect.anything())
  })

  it('switches certification on without touching the NOMIS screen', async () => {
    await request(app)
      .post('/prison-configuration/MDI/certification')
      .send({ status: 'ACTIVE', name: 'Moorland (HMP & YOI)' })
      .expect(302)

    expect(locationsService.updateCertificationApproval).toHaveBeenCalledWith(undefined, 'MDI', 'ACTIVE')
    expect(locationsService.updateResiStatus).not.toHaveBeenCalled()
    expect(prisonService.getScreenStatus).not.toHaveBeenCalled()
    expect(analyticsService.sendEvent).toHaveBeenCalledWith(expect.anything(), 'certification_status', {
      prison_id: 'MDI',
      status: 'ACTIVE',
    })
    expect(flashProvider).toHaveBeenCalledWith('success', {
      title: 'Certification switched on',
      content: 'Certification is now switched on for Moorland (HMP & YOI).',
    })
  })

  it.each([
    ['an unknown setting', '/prison-configuration/MDI/seg-in-roll-count', 'ACTIVE'],
    ['an unknown status', '/prison-configuration/MDI/certification', 'MAYBE'],
  ])('rejects %s', async (_, url, status) => {
    await request(app).post(url).send({ status }).expect(404)

    expect(locationsService.updateCertificationApproval).not.toHaveBeenCalled()
    expect(locationsService.updateResiStatus).not.toHaveBeenCalled()
  })

  it('is not available without the administrator role', async () => {
    app = createApp([])

    await request(app).post('/prison-configuration/MDI/certification').send({ status: 'ACTIVE' }).expect(403)
    expect(locationsService.updateCertificationApproval).not.toHaveBeenCalled()
  })
})
