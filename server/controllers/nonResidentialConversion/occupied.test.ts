import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import NonResidentialConversionOccupied from './occupied'
import LocationFactory from '../../testutils/factories/location'

describe('NonResidentialConversionOccupied', () => {
  const controller = new NonResidentialConversionOccupied({ route: '/' })
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
