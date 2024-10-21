import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import DeactivatePermanentWarning from './warning'
import LocationFactory from '../../../testutils/factories/location'

describe('DeactivatePermanentWarning', () => {
  const controller = new DeactivatePermanentWarning({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {} as unknown as FormWizard.Request
    res = {
      locals: {
        location: LocationFactory.build(),
      },
    } as unknown as Response
  })

  describe('locals', () => {
    it('returns the expected locals when back link not yet set', () => {
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      })
    })
  })

  it('returns the expected locals when back link already set', () => {
    res.locals.backLink = '/last/step'
    const result = controller.locals(req, res)

    expect(result).toEqual({
      backLink: '/last/step',
      cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
    })
  })
})
