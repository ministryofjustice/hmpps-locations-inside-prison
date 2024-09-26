import { jest } from '@jest/globals'
import LocationsApiClient from '../data/locationsApiClient'
import LocationsService from './locationsService'

function deepMock(object: any, returnValue?: any): object | jest.Mock {
  if (typeof object === 'object') {
    return Object.fromEntries(Object.entries(object).map(([k, n]) => [k, deepMock(n, returnValue)]))
  }

  if (typeof object === 'function') {
    return jest.fn().mockReturnValue(returnValue)
  }

  return object
}

describe('Locations service', () => {
  let locationsApiClient: jest.Mocked<LocationsApiClient>
  let locationsService: LocationsService

  beforeEach(() => {
    locationsApiClient = jest.mocked(new LocationsApiClient(null))
    locationsApiClient.constants = deepMock(locationsApiClient.constants, {
      a: [{ key: 'KEY', description: 'description' }],
    }) as typeof locationsApiClient.constants
    ;['locations', 'prisonerLocations', 'signedOperationalCapacity'].forEach(
      (k: 'locations' | 'prisonerLocations' | 'signedOperationalCapacity') => {
        locationsApiClient[k] = deepMock(locationsApiClient[k]) as any
      },
    )
    locationsService = new LocationsService(locationsApiClient)
  })

  function serviceCall(
    methodName: keyof Omit<LocationsService, 'locationsApiClient'>,
  ): (...args: unknown[]) => unknown {
    return locationsService[methodName].bind(locationsService)
  }

  function testConstantDataGetter(
    apiCallName: keyof LocationsApiClient['constants'],
    serviceCallName: keyof Omit<LocationsService, 'locationsApiClient'>,
  ) {
    describe(serviceCallName, () => {
      it('calls the correct client function', async () => {
        await serviceCall(serviceCallName)('token', 'TYPE')

        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledWith('token')
      })

      it('returns "Unknown" if the type does not exist', async () => {
        expect(await serviceCall(serviceCallName)('token', 'TYPE')).toEqual('Unknown')
      })

      it('returns the description if the type does exist', async () => {
        expect(await serviceCall(serviceCallName)('token', 'KEY')).toEqual('description')
      })

      it('only calls the api once per request', async () => {
        await serviceCall(serviceCallName)('token', 'TYPE')
        await serviceCall(serviceCallName)('token', 'TYPE')
        await serviceCall(serviceCallName)('token', 'TYPE')

        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledWith('token')
        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledTimes(1)
      })
    })
  }

  testConstantDataGetter('getAccommodationTypes', 'getAccommodationType')
  testConstantDataGetter('getConvertedCellTypes', 'getConvertedCellType')
  testConstantDataGetter('getDeactivatedReasons', 'getDeactivatedReason')
  testConstantDataGetter('getLocationTypes', 'getLocationType')
  testConstantDataGetter('getNonResidentialUsageTypes', 'getNonResidentialUsageType')
  testConstantDataGetter('getResidentialAttributeTypes', 'getResidentialAttributeType')
  testConstantDataGetter('getResidentialHousingTypes', 'getResidentialHousingType')
  testConstantDataGetter('getSpecialistCellTypes', 'getSpecialistCellType')
  testConstantDataGetter('getUsedForTypes', 'getUsedForType')

  describe('deactivateTemporary', () => {
    it('calls the correct client function', async () => {
      await locationsService.deactivateTemporary('token', 'locationId', 'reason', 'description', 'date', 'pfm')

      expect(locationsApiClient.locations.deactivate.temporary).toHaveBeenCalledWith(
        'token',
        {
          locationId: 'locationId',
        },
        {
          deactivationReason: 'reason',
          deactivationReasonDescription: 'description',
          proposedReactivationDate: 'date',
          planetFmReference: 'pfm',
        },
      )
    })
  })

  describe('getArchivedLocations', () => {
    it('calls the correct client function', async () => {
      await locationsService.getArchivedLocations('token', 'TST')

      expect(locationsApiClient.locations.prison.getArchivedLocations).toHaveBeenCalledWith('token', {
        prisonId: 'TST',
      })
    })
  })

  describe('getInactiveCells', () => {
    it('calls the correct client function', async () => {
      await locationsService.getInactiveCells('token', 'TST')

      expect(locationsApiClient.locations.prison.getInactiveCells).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })

  describe('getResidentialSummary', () => {
    it('calls the correct client function', async () => {
      await locationsService.getResidentialSummary('token', 'TST')

      expect(locationsApiClient.locations.getResidentialSummary).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })

  describe('getLocation', () => {
    it('calls the correct client function', async () => {
      await locationsService.getLocation('token', '481fc587-60f8-402b-804d-64462babddcc')

      expect(locationsApiClient.locations.getLocation).toHaveBeenCalledWith('token', {
        locationId: '481fc587-60f8-402b-804d-64462babddcc',
      })
    })
  })

  describe('getPrisonersInLocation', () => {
    it('calls the correct client function', async () => {
      await locationsService.getPrisonersInLocation('token', '481fc587-60f8-402b-804d-64462babddcc')

      expect(locationsApiClient.prisonerLocations.getPrisonersInLocation).toHaveBeenCalledWith('token', {
        locationId: '481fc587-60f8-402b-804d-64462babddcc',
      })
    })
  })

  describe('updateCapacity', () => {
    it('calls the correct client function', async () => {
      await locationsService.updateCapacity('token', '481fc587-60f8-402b-804d-64462babddcc', 1, 3)

      expect(locationsApiClient.locations.updateCapacity).toHaveBeenCalledWith(
        'token',
        {
          locationId: '481fc587-60f8-402b-804d-64462babddcc',
        },
        {
          maxCapacity: 1,
          workingCapacity: 3,
        },
      )
    })
  })

  describe('updateSpecialistCellTypes', () => {
    it('calls the correct client function', async () => {
      await locationsService.updateSpecialistCellTypes('token', '481fc587-60f8-402b-804d-64462babddcc', ['CAT_A'])

      expect(locationsApiClient.locations.updateSpecialistCellTypes).toHaveBeenCalledWith(
        'token',
        {
          locationId: '481fc587-60f8-402b-804d-64462babddcc',
        },
        ['CAT_A'],
      )
    })
  })

  describe('convertCellToNonResCell', () => {
    it('calls the correct client function', async () => {
      await locationsService.convertCellToNonResCell(
        'token',
        '481fc587-60f8-402b-804d-64462babddcc',
        'OTHER',
        'tuck shop',
      )

      expect(locationsApiClient.locations.convertCellToNonResCell).toHaveBeenCalledWith(
        'token',
        { locationId: '481fc587-60f8-402b-804d-64462babddcc' },
        { convertedCellType: 'OTHER', otherConvertedCellType: 'tuck shop' },
      )
    })
  })

  describe('convertToCell', () => {
    it('calls the correct client function', async () => {
      await locationsService.convertToCell(
        'token',
        '481fc587-60f8-402b-804d-64462babddcc',
        'NORMAL_ACCOMMODATION',
        ['ACCESSIBLE_CELL'],
        2,
        1,
        ['CLOSE_SUPERVISION_CENTRE'],
      )

      expect(locationsApiClient.locations.convertToCell).toHaveBeenCalledWith(
        'token',
        { locationId: '481fc587-60f8-402b-804d-64462babddcc' },
        {
          accommodationType: 'NORMAL_ACCOMMODATION',
          specialistCellTypes: ['ACCESSIBLE_CELL'],
          maxCapacity: 2,
          workingCapacity: 1,
          usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
        },
      )
    })
  })

  describe('updateNonResCell', () => {
    it('calls the correct client function', async () => {
      await locationsService.changeNonResType('token', '481fc587-60f8-402b-804d-64462babddcc', 'OFFICE')

      expect(locationsApiClient.locations.updateNonResCell).toHaveBeenCalledWith(
        'token',
        { locationId: '481fc587-60f8-402b-804d-64462babddcc' },
        { convertedCellType: 'OFFICE' },
      )
    })
  })

  describe('getAccommodationTypes', () => {
    it('calls the correct client function', async () => {
      await locationsService.getAccommodationTypes('token')

      expect(locationsApiClient.constants.getAccommodationTypes).toHaveBeenCalledWith('token')
    })
  })

  describe('getUsedForTypes', () => {
    it('calls the correct client function', async () => {
      await locationsService.getUsedForTypes('token')

      expect(locationsApiClient.constants.getUsedForTypes).toHaveBeenCalledWith('token')
    })
  })

  describe('getUsedForTypesForPrison', () => {
    it('calls the correct client function', async () => {
      await locationsService.getUsedForTypesForPrison('token', 'TST')

      expect(locationsApiClient.constants.getUsedForTypesForPrison).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })
})
