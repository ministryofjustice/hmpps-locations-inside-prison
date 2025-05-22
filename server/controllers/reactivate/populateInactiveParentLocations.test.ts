import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import populateInactiveParentLocations from './populateInactiveParentLocations'
import LocationFactory from '../../testutils/factories/location'
import { Location } from '../../data/types/locationsApi'

describe('populateInactiveParentLocations', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
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
    deepReq = {
      session: {},
      services: {
        locationsService: {
          getAccommodationType: jest.fn().mockResolvedValue('accommodationType'),
          getConvertedCellType: jest.fn().mockResolvedValue('convertedCellType'),
          getLocation: jest.fn((token: string, id: string) => Promise.resolve(locations.find(l => l.id === id))),
          getLocationType: jest.fn().mockResolvedValue('locationType'),
          getSpecialistCellType: jest.fn().mockResolvedValue('specialistCellType'),
          getUsedForType: jest.fn().mockResolvedValue('usedForType'),
        },
      },
    }
    deepRes = {
      locals: {
        user: {
          username: 'username',
        },
      },
    }
  })

  describe('when res.locals.cells is set', () => {
    beforeEach(() => {
      deepRes.locals.cells = [location1, location1, location1, location2]
    })

    it('sets the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(deepReq as FormWizard.Request, deepRes as Response, next)

      expect((deepRes.locals.inactiveParentLocations as Location[]).map(l => l.id)).toEqual(
        [parent1, parent2, parent3].map(l => l.id),
      )
      expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledTimes(4)
    })
  })

  describe('when res.locals.location is set', () => {
    beforeEach(() => {
      deepRes.locals.location = location1
    })

    it('sets the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(deepReq as FormWizard.Request, deepRes as Response, next)

      expect((deepRes.locals.inactiveParentLocations as Location[]).map(l => l.id)).toEqual(
        [parent1, parent2, parent3].map(l => l.id),
      )
      expect(deepReq.services.locationsService.getLocation).toHaveBeenCalledTimes(3)
    })
  })

  describe('when neither of the locals are set', () => {
    it('does not set the inactiveParentLocations local', async () => {
      await populateInactiveParentLocations(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.inactiveParentLocations).toEqual(undefined)
      expect(deepReq.services.locationsService.getLocation).not.toHaveBeenCalled()
    })
  })
})
