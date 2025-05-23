import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import DeactivatePermanentWarning from './warning'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('DeactivatePermanentWarning', () => {
  const controller = new DeactivatePermanentWarning({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {}
    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation(),
      },
    }
  })

  describe('locals', () => {
    it('returns the expected locals when back link not yet set', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      })
    })
  })

  it('returns the expected locals when back link already set', () => {
    deepRes.locals.backLink = '/last/step'
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

    expect(result).toEqual({
      backLink: '/last/step',
      cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
    })
  })
})
