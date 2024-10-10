import populateInactiveParentLocations from './populateInactiveParentLocations'
import LocationFactory from '../../testutils/factories/location'
import { Location } from '../../data/types/locationsApi'

describe('populateInactiveParentLocations', () => {
  let req: any
  let res: any
  let next: any

  const location1 = LocationFactory.build({
    id: 'l1',
    parentId: 'p1',
  })
  const location2 = LocationFactory.build({
    id: 'l2',
    parentId: 'p4',
    status: 'INACTIVE',
    active: false,
  })
  const parent1 = LocationFactory.build({
    id: 'p1',
    parentId: 'p2',
    status: 'INACTIVE',
    active: false,
  })
  const parent2 = LocationFactory.build({
    id: 'p2',
    parentId: 'p3',
    status: 'INACTIVE',
    active: false,
  })
  const parent3 = LocationFactory.build({
    id: 'p3',
    parentId: undefined,
    status: 'INACTIVE',
    active: false,
  })
  const parent4 = LocationFactory.build({
    id: 'p4',
    parentId: 'p5',
    status: 'ACTIVE',
    active: true,
  })

  const locations = [location1, location2, parent1, parent2, parent3, parent4]

  beforeEach(() => {
    next = jest.fn()
    req = {
      session: {},
      services: {
        authService: {
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService: {
          getAccommodationType: jest.fn().mockResolvedValue('accommodationType'),
          getConvertedCellType: jest.fn().mockResolvedValue('convertedCellType'),
          getLocation: jest.fn((token: string, id: string) => locations.find(l => l.id === id)),
          getLocationType: jest.fn().mockResolvedValue('locationType'),
          getSpecialistCellType: jest.fn().mockResolvedValue('specialistCellType'),
          getUsedForType: jest.fn().mockResolvedValue('usedForType'),
        },
      },
    }
    res = {
      locals: {
        user: {
          username: 'username',
        },
      },
    }
  })

  describe('when res.locals.cells is set', () => {
    beforeEach(() => {
      res.locals.cells = [location1, location1, location1, location2]
    })

    it('sets the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(req, res, next)

      expect((res.locals.inactiveParentLocations as Location[]).map(l => l.id)).toEqual(
        [parent1, parent2, parent3].map(l => l.id),
      )
      expect(req.services.locationsService.getLocation).toHaveBeenCalledTimes(4)
    })
  })

  describe('when res.locals.location is set', () => {
    beforeEach(() => {
      res.locals.location = location1
    })

    it('sets the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(req, res, next)

      expect((res.locals.inactiveParentLocations as Location[]).map(l => l.id)).toEqual(
        [parent1, parent2, parent3].map(l => l.id),
      )
      expect(req.services.locationsService.getLocation).toHaveBeenCalledTimes(3)
    })
  })

  describe('when neither of the locals are set', () => {
    it('does not set the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(req, res, next)

      expect(res.locals.inactiveParentLocations).toEqual(undefined)
      expect(req.services.locationsService.getLocation).not.toHaveBeenCalled()
    })
  })
})
