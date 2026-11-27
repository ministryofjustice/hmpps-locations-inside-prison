import type { Express } from 'express'
import request from 'supertest'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import LocationsService from '../services/locationsService'
import ManageUsersService from '../services/manageUsersService'
import config from '../config'

jest.mock('@ministryofjustice/hmpps-audit-client')
jest.mock('../services/locationsService')
jest.mock('../services/manageUsersService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      locationsService,
      manageUsersService,
    },
    userSupplier: () => user,
  })

  manageUsersService.getCaseloads.mockResolvedValue([{ id: 'TST', name: 'Test' }])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should redirect to add prison id', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
        manageUsersService,
      },
      userSupplier: () => user,
    })

    await request(app).get('/').expect(302).expect('Location', '/TST')
  })
})

describe('GET /TST', () => {
  it('displays the saved backlink and keeps page-specific back links when navigating', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })
    app = appWithAllRoutes({
      services: { auditService, locationsService, manageUsersService },
      userSupplier: () => ({ ...user, userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'] }),
    })
    const agent = request.agent(app)

    await agent
      .get('/save-backlink')
      .query({
        service: 'prison-roll-count',
        returnPath: '/in-reception?sort=name',
        redirectPath: '/TST',
        backLinkText: 'Back to In reception',
      })
      .expect(302)
      .expect('Location', `${config.ingressUrl}/TST`)

    const landingPage = await agent.get('/TST').expect(200)
    expect(landingPage.text).toContain(`href="${config.services.establishmentRoll}/in-reception?sort=name"`)
    expect(landingPage.text).toContain('Back to In reception')

    const formPage = await agent.get('/functional-mailboxes/default/add').expect(200)
    expect(formPage.text).toContain('href="/functional-mailboxes" class="govuk-back-link">Back</a>')
    expect(formPage.text).not.toContain('Back to In reception')
  })

  it('rejects unsafe return paths without replacing the saved backlink', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    const agent = request.agent(app)

    await agent
      .get('/save-backlink')
      .query({ service: 'prison-roll-count', returnPath: '/in-reception', redirectPath: '/TST' })
      .expect(302)

    await agent
      .get('/save-backlink')
      .query({ service: 'prison-roll-count', returnPath: '@example.com', redirectPath: '/TST' })
      .expect(400)

    const landingPage = await agent.get('/TST').expect(200)
    expect(landingPage.text).toContain(`href="${config.services.establishmentRoll}/in-reception"`)
    expect(landingPage.text).toContain('Back to Establishment roll')
  })

  it('should render index page with permission message when resiLocationServiceActive is INACTIVE', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
        manageUsersService,
      },
      userSupplier: () => user,
    })

    const res = await request(app).get('/TST')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toContain('Residential locations')
    expect(res.text).toContain('You do not have permission to view Residential locations.')

    expect(res.text).not.toContain('Manage residential locations')
    expect(res.text).not.toContain('View all inactive cells')
    expect(res.text).not.toContain('Archived locations')
    expect(res.text).not.toContain('Cell certificate')
  })

  it('should render index page with "Manage residential locations" when user has a residential role and certificationApprovalRequired is ACTIVE', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
        manageUsersService,
      },
      userSupplier: () => ({ ...user, userRoles: ['MANAGE_RESIDENTIAL_LOCATIONS'] }),
    })

    const res = await request(app).get('/TST')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toContain('Residential locations')
    expect(res.text).toContain('Manage residential locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')
    expect(res.text).toContain('Cell certificate')

    // MANAGE_RESIDENTIAL_LOCATIONS does not grant certificate_view_management
    expect(res.text).not.toContain('Capacity management dashboard')
  })

  it('should render the "Capacity management dashboard" tile for a certificate viewer', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
        manageUsersService,
      },
      userSupplier: () => ({ ...user, userRoles: ['RESI__CERT_VIEWER'] }),
    })

    const res = await request(app).get('/TST')

    expect(res.text).toContain('Capacity management dashboard')
    expect(res.text).toContain('View a summary of cell certificates and change requests for every establishment.')
    expect(res.text).toContain('/capacity-management-dashboard')
  })

  it('should render the functional mailbox tile only for an administrator', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })

    app = appWithAllRoutes({
      services: { auditService, locationsService, manageUsersService },
      userSupplier: () => ({ ...user, userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'] }),
    })
    expect((await request(app).get('/TST')).text).toContain('Manage functional mailboxes')

    app = appWithAllRoutes({
      services: { auditService, locationsService, manageUsersService },
      userSupplier: () => ({ ...user, userRoles: ['MANAGE_RESIDENTIAL_LOCATIONS'] }),
    })
    expect((await request(app).get('/TST')).text).not.toContain('Manage functional mailboxes')
  })

  it.each([['RESI__CERT_REVIEWER'], ['MANAGE_RES_LOCATIONS_OP_CAP']])(
    'should not render the "Capacity management dashboard" tile for the %s role',
    async role => {
      locationsService.getPrisonConfiguration.mockResolvedValue({
        prisonId: 'TST',
        resiLocationServiceActive: 'ACTIVE',
        nonResiServiceActive: 'INACTIVE',
        includeSegregationInRollCount: 'INACTIVE',
        certificationApprovalRequired: 'ACTIVE',
      })

      app = appWithAllRoutes({
        services: {
          auditService,
          locationsService,
          manageUsersService,
        },
        userSupplier: () => ({ ...user, userRoles: [role] }),
      })

      const res = await request(app).get('/TST')

      expect(res.text).not.toContain('Capacity management dashboard')
    },
  )

  it('should render the residential cards for a user with no roles when resi service is active', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
        manageUsersService,
      },
      userSupplier: () => user,
    })

    const res = await request(app).get('/TST')

    expect(res.text).not.toContain('permission to view Residential locations')
    expect(res.text).not.toContain('permission to manage Residential locations')

    expect(res.text).toContain('Manage residential locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')
    expect(res.text).toContain('View the current certificate and requested changes.')

    expect(res.text).not.toContain('Import cell certificate')
    expect(res.text).not.toContain('Capacity management dashboard')
    expect(res.text).not.toContain('Switch MVP1 or certification on or off for each prison.')
  })
})

describe('caseload switch from the DPS header', () => {
  const switched = 'caseload-switched-from=TST&caseload-switched-to=CFI'
  const userAtCardiff = {
    ...user,
    activeCaseload: { id: 'CFI', name: 'Cardiff (HMP)' },
    caseloads: [
      { id: 'TST', name: 'Test (HMP)' },
      { id: 'CFI', name: 'Cardiff (HMP)' },
    ],
  }

  const appFor = (userSupplier: () => typeof user) =>
    appWithAllRoutes({ services: { auditService, locationsService, manageUsersService }, userSupplier })

  it.each([
    { scenario: 'the prison home page', path: '/TST' },
    { scenario: 'a location page', path: '/TST/7e570000-0000-0000-0000-000000000001' },
    { scenario: 'a section page', path: '/TST/archived-locations?sort=name' },
  ])('sends the user from $scenario to the new prison home page', async ({ path }) => {
    const separator = path.includes('?') ? '&' : '?'

    await request(appFor(() => userAtCardiff))
      .get(`${path}${separator}${switched}`)
      .expect(302)
      .expect('Location', '/CFI')

    expect(locationsService.getPrisonConfiguration).not.toHaveBeenCalled()
  })

  it('redirects rather than failing when the user no longer has the old prison', async () => {
    await request(appFor(() => ({ ...userAtCardiff, caseloads: [{ id: 'CFI', name: 'Cardiff (HMP)' }] })))
      .get(`/TST?${switched}`)
      .expect(302)
      .expect('Location', '/CFI')
  })

  it('only strips the switch parameters when the url already matches the active caseload', async () => {
    await request(appFor(() => user))
      .get('/TST/archived-locations?sort=name&caseload-switched-from=CFI&caseload-switched-to=TST')
      .expect(302)
      .expect('Location', '/TST/archived-locations?sort=name')
  })

  it('resolves a switch on the service root, for users without the header javascript', async () => {
    // Without header.js there is no backUrl, so DPS falls back to the referer, which browsers reduce
    // to our origin. The root adds the active caseload, then the switch parameters are stripped.
    const agent = request(appFor(() => userAtCardiff))

    await agent.get(`/?${switched}`).expect(302).expect('Location', `/CFI?${switched}`)
    await agent.get(`/CFI?${switched}`).expect(302).expect('Location', '/CFI')
  })
})
