import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import setUpCurrentUser from './setUpCurrentUser'
import { Services } from '../services'
import config from '../config'

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    name: 'john smith',
    user_id: '123',
    authorities: ['ROLE_USER', 'ROLE_ADMIN'],
  })),
}))

const mockGetUserCaseloads = jest.fn()
const baseServices: Services = {
  manageUsersService: { getUserCaseloads: mockGetUserCaseloads },
} as any

describe('setUpCurrentUser middleware', () => {
  let app: express.Express
  let originalProduction: boolean

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use((req, res, next) => {
      res.locals.user = {
        token: 'token',
        username: 'testuser',
        authSource: 'nomis',
      }
      req.cookies = {}
      next()
    })
    mockGetUserCaseloads.mockResolvedValue({
      activeCaseload: 'MDI',
      caseloads: ['MDI', 'LEI'],
    })
    originalProduction = config.production
  })

  afterEach(() => {
    config.production = originalProduction
    jest.clearAllMocks()
  })

  it('populates user details and calls next()', async () => {
    app.use(setUpCurrentUser(baseServices))
    app.use((req, res) => res.status(200).json(res.locals.user))
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.userId).toBe('123')
    expect(res.body.displayName).toBe('John Smith')
    expect(res.body.userRoles).toEqual(['USER', 'ADMIN'])
    expect(res.body.activeCaseload).toBe('MDI')
    expect(res.body.caseloads).toEqual(['MDI', 'LEI'])
    expect(res.body.staffId).toBe(123)
  })

  describe('permission override', () => {
    it('applies permission override in non-production with roleOverride cookie', async () => {
      config.production = false
      app.use((req, res, next) => {
        req.cookies = { roleOverride: 'OVERRIDE1, OVERRIDE2' }
        next()
      })
      app.use(setUpCurrentUser(baseServices))
      app.use((req, res) => res.status(200).json(res.locals.user))
      const res = await request(app).get('/')
      expect(res.body.userRoles).toEqual(['PERMISSION_OVERRIDE', 'OVERRIDE1', 'OVERRIDE2'])
    })

    it('does not apply permission override in production', async () => {
      config.production = true
      app.use((req, res, next) => {
        req.cookies = { roleOverride: 'OVERRIDE1, OVERRIDE2' }
        next()
      })
      app.use(setUpCurrentUser(baseServices))
      app.use((req, res) => res.status(200).json(res.locals.user))
      const res = await request(app).get('/')
      expect(res.body.userRoles).toEqual(['USER', 'ADMIN'])
    })
  })

  it('sets staffId only for nomis authSource', async () => {
    app.use((req, res, next) => {
      res.locals.user.authSource = 'nomis'
      next()
    })
    app.use(setUpCurrentUser(baseServices))
    app.use((req, res) => res.status(200).json(res.locals.user))
    const res = await request(app).get('/')
    expect(res.body.staffId).toBe(123)
  })

  it('does not set staffId for non-nomis authSource', async () => {
    app.use((req, res, next) => {
      res.locals.user.authSource = 'azuread'
      next()
    })
    app.use(setUpCurrentUser(baseServices))
    app.use((req, res) => res.status(200).json(res.locals.user))
    const res = await request(app).get('/')
    expect(res.body.staffId).toBeUndefined()
  })

  it('logs and calls next(error) on failure', async () => {
    const error = new Error('fail')
    mockGetUserCaseloads.mockRejectedValue(error)
    const mockLogger = { error: jest.fn() }
    jest.doMock('../../logger', () => mockLogger)
    app.use(setUpCurrentUser(baseServices))
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({ error: err.message })
    })
    const res = await request(app).get('/')
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('fail')
  })
})
