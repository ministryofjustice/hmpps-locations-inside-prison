import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../services/locationsService'
import getCellCount from './getCellCount'
import buildDecoratedLocation from '../testutils/buildDecoratedLocation'

describe('getCellCount', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
      services: {
        locationsService,
      },
      session: {
        systemToken: 'token',
      },
    }
    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation(),
        user: {
          username: 'CBURBAGE',
        },
      },
    }

    locationsService.getResidentialSummary = jest
      .fn()
      .mockResolvedValue({ parentLocation: { numberOfCellLocations: 10, inactiveCells: 2 } })
  })

  describe('when location is a CELL', () => {
    beforeEach(() => {
      deepRes.locals.decoratedLocation.raw.locationType = 'CELL'
    })

    it('sets cellCount to 1 without calling the API', async () => {
      const callback = jest.fn()
      await getCellCount(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepRes.locals.cellCount).toBe(1)
      expect(deepReq.services.locationsService.getResidentialSummary).not.toHaveBeenCalled()
    })
  })

  describe('when location is not a CELL', () => {
    beforeEach(() => {
      deepRes.locals.decoratedLocation.raw.locationType = 'LANDING'
    })

    it('calls the API to get cell count', async () => {
      const callback = jest.fn()
      await getCellCount(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepRes.locals.cellCount).toBe(8)
    })
  })
})
