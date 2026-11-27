import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'

import handleCaseloadChange from './handleCaseloadChange'

const SWITCHED = 'caseload-switched-from=BFI&caseload-switched-to=CFI'

describe('handleCaseloadChange', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: jest.Mock

  const run = () => handleCaseloadChange(deepReq as Request, deepRes as Response, next)

  beforeEach(() => {
    deepReq = { query: {}, originalUrl: '/BFI' }
    deepRes = {
      locals: {
        user: { activeCaseload: { id: 'BFI', name: 'Bristol (HMP)' } },
        prisonId: 'BFI',
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
  })

  it('does nothing without the switch parameters', () => {
    run()

    expect(next).toHaveBeenCalledWith()
    expect(deepRes.redirect).not.toHaveBeenCalled()
  })

  it('does nothing for a deliberate visit to another prison', () => {
    deepRes.locals.user.activeCaseload = { id: 'CFI', name: 'Cardiff (HMP)' }
    deepReq.query = { sort: 'name' }
    deepReq.originalUrl = '/BFI/archived-locations?sort=name'

    run()

    expect(next).toHaveBeenCalledWith()
    expect(deepRes.redirect).not.toHaveBeenCalled()
  })

  it('ignores the caseloadChanged flag, which DPS reads but never sends back to us', () => {
    deepReq.query = { caseloadChanged: 'true' }
    deepReq.originalUrl = '/BFI?caseloadChanged=true'

    run()

    expect(next).toHaveBeenCalledWith()
    expect(deepRes.redirect).not.toHaveBeenCalled()
  })

  describe('when the caseload has changed', () => {
    beforeEach(() => {
      deepRes.locals.user.activeCaseload = { id: 'CFI', name: 'Cardiff (HMP)' }
      deepReq.query = { 'caseload-switched-from': 'BFI', 'caseload-switched-to': 'CFI' }
    })

    it.each([
      { scenario: 'the prison home page', url: `/BFI?${SWITCHED}` },
      { scenario: 'a location page', url: `/BFI/7e570000-0000-0000-0000-000000000001?${SWITCHED}` },
      {
        scenario: 'a page within a location',
        url: `/BFI/7e570000-0000-0000-0000-000000000001/change-cell-capacity?${SWITCHED}`,
      },
      { scenario: 'a section page with its own query', url: `/BFI/archived-locations?sort=name&${SWITCHED}` },
    ])('redirects from $scenario to the new prison home page', ({ url }) => {
      deepReq.originalUrl = url

      run()

      expect(deepRes.redirect).toHaveBeenCalledWith('/CFI')
      expect(next).not.toHaveBeenCalled()
    })

    it('takes the prison from the active caseload, not from the parameters', () => {
      deepReq.query = { 'caseload-switched-from': 'BFI', 'caseload-switched-to': 'XYZ' }
      deepReq.originalUrl = '/BFI?caseload-switched-from=BFI&caseload-switched-to=XYZ'

      run()

      expect(deepRes.redirect).toHaveBeenCalledWith('/CFI')
    })
  })

  describe('when the url already matches the active caseload', () => {
    beforeEach(() => {
      deepReq.query = { 'caseload-switched-from': 'CFI', 'caseload-switched-to': 'BFI' }
    })

    it('redirects to strip the switch parameters only', () => {
      deepReq.originalUrl = '/BFI/archived-locations?caseload-switched-from=CFI&caseload-switched-to=BFI'

      run()

      expect(deepRes.redirect).toHaveBeenCalledWith('/BFI/archived-locations')
      expect(next).not.toHaveBeenCalled()
    })

    it('keeps the other query parameters', () => {
      deepReq.originalUrl = '/BFI/archived-locations?sort=name&caseload-switched-from=CFI&caseload-switched-to=BFI'

      run()

      expect(deepRes.redirect).toHaveBeenCalledWith('/BFI/archived-locations?sort=name')
    })
  })

  it.each(['caseload-switched-from', 'caseload-switched-to'])('strips %s when it arrives on its own', param => {
    deepReq.query = { [param]: 'CFI' }
    deepReq.originalUrl = `/BFI?${param}=CFI`

    run()

    expect(deepRes.redirect).toHaveBeenCalledWith('/BFI')
  })

  it('strips the switch parameters without a path rewrite when there is no active caseload', () => {
    deepReq.query = { 'caseload-switched-from': 'BFI', 'caseload-switched-to': 'CFI' }
    deepReq.originalUrl = `/BFI?${SWITCHED}`
    deepRes.locals.user = {}

    run()

    expect(deepRes.redirect).toHaveBeenCalledWith('/BFI')
  })
})
