import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import LocationFactory from '../../testutils/factories/location'
import DeactivateTemporaryOccupied from './occupied'

describe('DeactivateTemporaryOccupied', () => {
  const controller = new DeactivateTemporaryOccupied({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = { session: {} } as unknown as typeof req
    res = {
      locals: {
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
        }),
      },
    } as unknown as typeof res
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(req, res)).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      })
    })
  })
})
