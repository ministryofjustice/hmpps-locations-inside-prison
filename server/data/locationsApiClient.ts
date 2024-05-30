import config from '../config'
import RestClient from './restClient'
import logger from '../../logger'
import { RedisClient } from './redisClient'

export interface Location {
  id: string
  prisonId: string
  code: string
  pathHierarchy: string
  locationType: string
  residentialHousingType: string
  localName: string
  comments: string
  permanentlyInactive: boolean
  permanentlyInactiveReason: string
  capacity: {
    maxCapacity: number
    workingCapacity: number
  }
  certification: {
    certified: boolean
    capacityOfCertifiedCell: number
  }
  attributes: string[]
  usage: {
    usageType: string
    capacity: number
    sequence: number
  }[]
  accommodationTypes: string[]
  specialistCellTypes: string[]
  usedFor: string[]
  orderWithinParentLocation: number
  status: string
  convertedCellType: string
  otherConvertedCellType: string
  active: boolean
  deactivatedByParent: boolean
  deactivatedDate: string
  deactivatedReason: string
  deactivatedBy: string
  proposedReactivationDate: string
  topLevelId: string
  parentId: string
  parentLocation: string
  inactiveCells: number
  childLocations: string[]
  changeHistory: {
    attribute: string
    oldValue: string
    newValue: string
    amendedBy: string
    amendedDate: string
  }[]
  lastModifiedBy: string
  lastModifiedDate: string
  key: string
  isResidential: boolean
}

interface ResidentialSummary {
  prisonSummary: {
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
  }
  subLocationName: string
  subLocations: Location[]
}

export default class LocationsApiClient {
  constructor(private readonly redisClient: RedisClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Locations Api Client', config.apis.locationsApi, token)
  }

  private apiCall<ReturnType extends object | string, Parameters extends { [k: string]: string }>({
    path,
    requestType,
    options,
  }: {
    path: string
    requestType: 'get' | 'post'
    options?: {
      cacheDuration: number
    }
  }) {
    return async (token: string, parameters: Parameters = {} as never): Promise<ReturnType> => {
      const filledPath = path.replace(/:(\w+)/g, (_, name) => parameters[name])

      const cacheDuration = options?.cacheDuration || 0
      if (cacheDuration && this.redisClient) {
        logger.debug(`Getting ${filledPath} from redis`)
        const cachedResult = await this.redisClient.get(filledPath)

        if (cachedResult) {
          logger.debug(`Found ${filledPath} in redis, value: ${cachedResult}`)

          if (typeof cachedResult === 'string') {
            return JSON.parse(cachedResult)
          }

          return cachedResult as ReturnType
        }
      }

      const result = await LocationsApiClient.restClient(token)[requestType]<ReturnType>({
        path: filledPath,
      })

      if (cacheDuration && this.redisClient) {
        logger.debug(`Setting ${filledPath} in redis for ${cacheDuration} seconds, value: ${JSON.stringify(result)}`)

        await this.redisClient.set(filledPath, JSON.stringify(result), { EX: cacheDuration })
      }

      return result
    }
  }

  constants = {
    getAccommodationTypes: this.apiCall<{ accommodationTypes: { key: string; description: string }[] }, null>({
      path: '/constants/accommodation-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getUsedForTypes: this.apiCall<{ usedForTypes: { key: string; description: string }[] }, null>({
      path: '/constants/used-for-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
  }

  locations = {
    getResidentialSummary: this.apiCall<ResidentialSummary, { prisonId: string }>({
      path: '/locations/residential-summary/:prisonId',
      requestType: 'get',
    }),
  }
}
