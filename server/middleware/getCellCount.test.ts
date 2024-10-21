import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'
import getCellCount from './getCellCount'
import LocationFactory from '../testutils/factories/location'

describe('getCellCount', () => {
  let req: FormWizard.Request
  let res: Response
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      services: {
        authService,
        locationsService,
      },
    } as unknown as FormWizard.Request
    res = {
      locals: {
        location: LocationFactory.build(),
        user: {
          username: 'CBURBAGE',
        },
      },
    } as unknown as Response

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getResidentialSummary = jest
      .fn()
      .mockResolvedValue({ parentLocation: { numberOfCellLocations: 10, inactiveCells: 2 } })
  })

  describe('when location is a CELL', () => {
    beforeEach(() => {
      res.locals.location.raw = { ...res.locals.location, locationType: 'CELL' }
    })

    it('sets cellCount to 1 without calling the API', async () => {
      const callback = jest.fn()
      await getCellCount(req, res, callback)

      expect(res.locals.cellCount).toBe(1)
      expect(req.services.authService.getSystemClientToken).not.toHaveBeenCalled()
      expect(req.services.locationsService.getResidentialSummary).not.toHaveBeenCalled()
    })
  })

  describe('when location is not a CELL', () => {
    beforeEach(() => {
      res.locals.location.raw = { ...res.locals.location, locationType: 'LANDING' }
    })

    it('calls the API to get cell count', async () => {
      const callback = jest.fn()
      await getCellCount(req, res, callback)

      expect(res.locals.cellCount).toBe(8)
    })
  })
})
