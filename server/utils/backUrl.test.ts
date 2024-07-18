import backUrl from './backUrl'

describe('backUrl', () => {
  let req: any

  beforeEach(() => {
    req = {
      session: {},
    }
  })

  it('returns the referrer if present', () => {
    req.session.referrerUrl = '/the/referrer/url'
    const result = backUrl(req, {
      fallbackUrl: `/the/fallback/url`,
      nextStepUrl: `/form-journey-1/step-2`,
    })

    expect(result).toEqual('/the/referrer/url')
  })

  it('returns the fallback URL if referred by clicking back from the next step', () => {
    req.session.referrerUrl = '/form-journey-1/step-2'
    const result = backUrl(req, {
      fallbackUrl: `/the/fallback/url`,
      nextStepUrl: `/form-journey-1/step-2`,
    })

    expect(result).toEqual('/the/fallback/url')
  })

  it('returns the fallback URL if there is no referrer', () => {
    const result = backUrl(req, {
      fallbackUrl: `/the/fallback/url`,
    })

    expect(result).toEqual('/the/fallback/url')
  })
})
