import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import NonResidentialConversionWarning from './warning'
import LocationFactory from '../../testutils/factories/location'

describe('NonResidentialConversionWarning', () => {
  const controller = new NonResidentialConversionWarning({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    // @ts-ignore
    req = {}
    res = {
      // @ts-ignore
      locals: {
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
        }),
      },
    }
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(req, res)).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      })
    })
  })
})