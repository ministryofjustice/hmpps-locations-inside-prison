import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import populateCells from './populateCells'
import LocationFactory from '../../../testutils/factories/location'

describe('populateCells', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  const locationIds = ['l1', 'l2', 'l3']
  const locations = {
    l1: LocationFactory.build({ id: 'l1' }),
    l2: LocationFactory.build({ id: 'l2' }),
    l3: LocationFactory.build({ id: 'l3' }),
  }

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      session: { systemToken: 'token' },
      sessionModel: { get: jest.fn().mockReturnValue(locationIds) },
      services: {
        locationsService: {
          getInactiveCells: jest.fn().mockResolvedValue([locations.l3, locations.l2, locations.l1]),
          getLocation: jest.fn((_token: string, id: keyof typeof locations) => Promise.resolve(locations[id])),
        },
      },
    }
    deepRes = {
      locals: {
        prisonId: 'TST',
        locationId: 'wing-id',
        user: {
          username: 'username',
        },
      },
    }
  })

  it('sets the cells local in the order selected, from one call for the inactive cells', async () => {
    await populateCells(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.cells).toEqual(Object.values(locations))
    expect(deepReq.services.locationsService.getInactiveCells).toHaveBeenCalledTimes(1)
    expect(deepReq.services.locationsService.getInactiveCells).toHaveBeenCalledWith('token', 'TST', 'wing-id')
    expect(deepReq.services.locationsService.getLocation).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('looks up a selected cell that is no longer inactive on its own', async () => {
    deepReq.services.locationsService.getInactiveCells = jest.fn().mockResolvedValue([locations.l1, locations.l3])

    await populateCells(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.cells).toEqual(Object.values(locations))
    expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledTimes(1)
    expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledWith('token', 'l2')
  })

  it('looks up no more than 10 missing cells at a time, keeping them in the order selected', async () => {
    const cells = Array.from({ length: 40 }, (_, i) => LocationFactory.build({ id: `cell-${i}` }))
    let running = 0
    let maxRunning = 0
    deepReq.sessionModel.get = jest.fn().mockReturnValue(cells.map(cell => cell.id))
    deepReq.services.locationsService.getInactiveCells = jest.fn().mockResolvedValue([])
    deepReq.services.locationsService.getLocation = jest.fn(async (_token: string, id: string) => {
      running += 1
      maxRunning = Math.max(maxRunning, running)
      await new Promise(resolve => {
        setTimeout(resolve, 1)
      })
      running -= 1
      return cells.find(cell => cell.id === id)
    })

    await populateCells(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.cells).toEqual(cells)
    expect(maxRunning).toEqual(10)
  })
})
