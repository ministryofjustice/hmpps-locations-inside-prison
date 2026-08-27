import express, { type Express, type Request, type Response } from 'express'
import request from 'supertest'

import legacyRedirectRouter from './legacyRedirectRouter'

const PRISON_ID = 'TST'
const UUID = '7e570000-0000-1000-8001-000000000001'

describe('legacyRedirectRouter', () => {
  let app: Express
  const locationsService = {
    getLocation: jest.fn(),
  }

  beforeEach(() => {
    locationsService.getLocation.mockResolvedValue({ prisonId: PRISON_ID })

    app = express()
    app.use((req: Request, res: Response, next) => {
      Object.assign(req, {
        services: { locationsService },
        session: { systemToken: 'system-token' },
      })

      res.locals.user = {
        activeCaseload: { id: PRISON_ID },
      } as any

      req.user = {
        caseloads: [{ id: PRISON_ID }],
      } as any

      next()
    })

    app.use(legacyRedirectRouter)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('routes with optional prison id when none is provided', () => {
    it.each([
      ['/admin', `/admin/${PRISON_ID}`],
      ['/archived-locations', `/archived-locations/${PRISON_ID}`],
      ['/inactive-cells', `/inactive-cells/${PRISON_ID}`],
      ['/reactivate/cells', `/reactivate/cells/${PRISON_ID}`],
      ['/view-and-update-locations', `/view-and-update-locations/${PRISON_ID}`],
    ])('redirects %s to %s', async (legacyPath, newPath) => {
      await request(app).get(legacyPath).expect(302).expect('Location', newPath)
    })
  })

  describe('routes that redirect using an explicit prison id', () => {
    it.each([
      ['/admin/TST', '/TST/admin'],
      ['/admin/TST/change-certification-status', '/TST/admin/change-certification-status'],
      ['/admin/TST/change-include-seg-in-roll-count', '/TST/admin/change-include-seg-in-roll-count'],
      ['/admin/TST/change-nomis-screen-status/A', '/TST/admin/change-nomis-screen-status/A'],
      ['/admin/TST/change-non-resi-status', '/TST/admin/change-non-resi-status'],
      ['/admin/TST/change-resi-status', '/TST/admin/change-resi-status'],
      ['/admin/TST/ingest-cert', '/TST/cell-certificate-imports'],
      ['/TST/admin/ingest-cert', '/TST/cell-certificate-imports'],
      ['/TST/cell-certificate-uploads', '/TST/cell-certificate-imports'],
      [
        '/TST/cell-certificate-uploads/upload/7e570000-0000-1000-8001-000000000001',
        '/TST/cell-certificate-imports/import/7e570000-0000-1000-8001-000000000001',
      ],
      ['/TST/cell-certificate-uploads/new', '/TST/cell-certificate-imports/new'],
      ['/archived-locations/TST', '/TST/archived-locations'],
      ['/change-signed-operational-capacity/TST', '/TST/change-signed-operational-capacity'],
      ['/inactive-cells/TST', '/TST/inactive-cells'],
      [
        '/inactive-cells/TST/7e570000-0000-1000-8001-000000000001',
        '/TST/7e570000-0000-1000-8001-000000000001/inactive-cells',
      ],
      ['/reactivate/cells/TST', '/TST/reactivate/cells'],
      ['/view-and-update-locations/TST', '/TST/view'],
      [
        '/view-and-update-locations/TST/7e570000-0000-1000-8001-000000000001',
        '/TST/7e570000-0000-1000-8001-000000000001/view',
      ],
      ['/create-new/TST', '/TST/create'],
      ['/delete-draft/TST', '/TST/delete'],
    ])('redirects %s to %s', async (legacyPath, newPath) => {
      await request(app).get(legacyPath).expect(302).expect('Location', newPath)
    })

    it('does not allow the base admin route to swallow admin sub-routes', async () => {
      await request(app)
        .get('/admin/TST/change-certification-status')
        .expect(302)
        .expect('Location', '/TST/admin/change-certification-status')
    })

    it('does not look up location details when prison id is supplied in prisonOrLocationId', async () => {
      await request(app).get('/create-new/TST').expect(302)
      await request(app).get('/delete-draft/TST').expect(302)

      expect(locationsService.getLocation).not.toHaveBeenCalled()
    })
  })

  describe('routes that resolve prison id from location id', () => {
    it.each([
      [`/create-cells/${UUID}`, `/${PRISON_ID}/${UUID}/create-cells`],
      [`/edit-cells/${UUID}`, `/${PRISON_ID}/${UUID}/edit-cells`],
      [`/create-new/${UUID}`, `/${PRISON_ID}/${UUID}/create`],
      [`/delete-draft/${UUID}`, `/${PRISON_ID}/${UUID}/delete`],
      [`/location/${UUID}/add-local-name`, `/${PRISON_ID}/${UUID}/add-local-name`],
      [`/location/${UUID}/add-to-certificate`, `/${PRISON_ID}/${UUID}/add-to-certificate`],
      [`/location/${UUID}/archive`, `/${PRISON_ID}/${UUID}/archive`],
      [`/location/${UUID}/cell-conversion`, `/${PRISON_ID}/${UUID}/cell-conversion`],
      [`/location/${UUID}/change-cell-capacity`, `/${PRISON_ID}/${UUID}/change-cell-capacity`],
      [`/location/${UUID}/change-cell-type`, `/${PRISON_ID}/${UUID}/change-cell-type`],
      [`/location/${UUID}/change-door-number`, `/${PRISON_ID}/${UUID}/change-door-number`],
      [`/location/${UUID}/change-local-name`, `/${PRISON_ID}/${UUID}/change-local-name`],
      [`/location/${UUID}/change-location-code`, `/${PRISON_ID}/${UUID}/change-location-code`],
      [`/location/${UUID}/change-non-residential-type`, `/${PRISON_ID}/${UUID}/change-non-residential-type`],
      [`/location/${UUID}/change-sanitation`, `/${PRISON_ID}/${UUID}/change-sanitation`],
      [
        `/location/${UUID}/change-temporary-deactivation-details`,
        `/${PRISON_ID}/${UUID}/change-temporary-deactivation-details`,
      ],
      [`/location/${UUID}/change-used-for`, `/${PRISON_ID}/${UUID}/change-used-for`],
      [`/location/${UUID}/deactivate`, `/${PRISON_ID}/${UUID}/deactivate`],
      [`/location/${UUID}/non-residential-conversion`, `/${PRISON_ID}/${UUID}/non-residential-conversion`],
      [`/location/${UUID}/remove-cell-type`, `/${PRISON_ID}/${UUID}/remove-cell-type`],
      [`/location/${UUID}/remove-local-name`, `/${PRISON_ID}/${UUID}/remove-local-name`],
      [`/location/${UUID}/set-cell-type`, `/${PRISON_ID}/${UUID}/set-cell-type`],
      [`/location/${UUID}/working-capacity-mismatch`, `/${PRISON_ID}/${UUID}/working-capacity-mismatch`],
      [`/location-history/${UUID}`, `/${PRISON_ID}/${UUID}/history`],
      [`/reactivate/cell/${UUID}`, `/${PRISON_ID}/${UUID}/reactivate/cell`],
      [`/reactivate/location/${UUID}`, `/${PRISON_ID}/${UUID}/reactivate/location`],
      [`/reactivate/parent/${UUID}`, `/${PRISON_ID}/${UUID}/reactivate/parent`],
    ])('redirects %s to %s', async (legacyPath, newPath) => {
      await request(app).get(legacyPath).expect(302).expect('Location', newPath)
      expect(locationsService.getLocation).toHaveBeenLastCalledWith('system-token', UUID)
    })

    it('returns 404 when user does not have access to the prison for the location', async () => {
      locationsService.getLocation.mockResolvedValue({ prisonId: 'MDI' })

      const newApp = express()
      newApp.use((req: Request, res: Response, next) => {
        Object.assign(req, {
          services: { locationsService },
          session: { systemToken: 'system-token' },
        })

        res.locals.user = {
          activeCaseload: { id: PRISON_ID },
        } as any

        req.user = {
          caseloads: [{ id: 'OTHER' }],
        } as any

        next()
      })
      newApp.use(legacyRedirectRouter)

      await request(newApp).get(`/create-new/${UUID}`).expect(404)

      expect(locationsService.getLocation).toHaveBeenCalledWith('system-token', UUID)
    })
  })
})
