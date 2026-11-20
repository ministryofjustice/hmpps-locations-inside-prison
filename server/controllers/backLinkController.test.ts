import type { Request, Response } from 'express'
import config from '../config'
import { registeredBackLinkServices, saveBackLink } from './backLinkController'

describe('Back Link Controller', () => {
  it('saves the return link and redirects to the requested locations page', () => {
    const req = {
      query: {
        service: 'prison-roll-count',
        returnPath: '/in-reception',
        redirectPath: '/TST',
        backLinkText: 'Back to In Reception',
      },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    saveBackLink()(req, res, jest.fn())

    expect(req.session.userBackLink).toEqual({
      url: `${config.services.establishmentRoll}/in-reception`,
      text: 'Back to In Reception',
    })
    expect(res.redirect).toHaveBeenCalledWith(`${config.ingressUrl}/TST`)
  })

  it('uses the registered service default back link text when none is provided', () => {
    const req = {
      query: {
        service: 'non-residential-locations',
        returnPath: '/locations',
        redirectPath: '/TST',
      },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    saveBackLink()(req, res, jest.fn())

    expect(req.session.userBackLink).toEqual({
      url: `${config.services.nonResidentialLocations}/locations`,
      text: 'Back to Non-residential locations',
    })
  })

  it('normalizes trailing slashes on a registered service URL', () => {
    const req = {
      query: { service: 'test-service', returnPath: '/list?sort=name', redirectPath: '/TST' },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    saveBackLink([{ name: 'test-service', hostname: 'https://service.example///', defaultBackLinkText: 'Back' }])(
      req,
      res,
      jest.fn(),
    )

    expect(req.session.userBackLink).toEqual({ url: 'https://service.example/list?sort=name', text: 'Back' })
  })

  it('rejects missing required query parameters', () => {
    const req = { query: {}, session: {} } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    expect(() => saveBackLink()(req, res, jest.fn())).toThrow('Required query parameters missing')
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('rejects unregistered services', () => {
    const req = {
      query: {
        service: 'unknown-service',
        returnPath: '/locations',
        redirectPath: '/TST',
      },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    expect(() => saveBackLink()(req, res, jest.fn())).toThrow('Could not find service: [unknown-service]')
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it.each([
    ['returnPath', '@example.com/path'],
    ['returnPath', '//example.com/path'],
    ['returnPath', '/\\example.com/path'],
    ['redirectPath', '@example.com/path'],
    ['redirectPath', '//example.com/path'],
    ['redirectPath', '/\r\nexample.com'],
  ])('rejects unsafe %s values', (key, value) => {
    const req = {
      query: {
        service: 'prison-roll-count',
        returnPath: '/in-reception',
        redirectPath: '/TST',
        [key]: value,
      },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    expect(() => saveBackLink()(req, res, jest.fn())).toThrow('Return and redirect paths must be local paths')
    expect(req.session.userBackLink).toBeUndefined()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('rejects non-string optional link text', () => {
    const req = {
      query: {
        service: 'prison-roll-count',
        returnPath: '/in-reception',
        redirectPath: '/TST',
        backLinkText: ['one', 'two'],
      },
      session: {},
    } as unknown as Request
    const res = { redirect: jest.fn() } as unknown as Response

    expect(() => saveBackLink()(req, res, jest.fn())).toThrow('Invalid back link text')
    expect(req.session.userBackLink).toBeUndefined()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('exposes the configured services as valid backlink sources', () => {
    expect(registeredBackLinkServices.map(service => service.name)).toEqual([
      'digital-prison-services',
      'non-residential-locations',
      'prison-roll-count',
    ])
  })
})
