import { NotImplemented } from 'http-errors'
import config from '../config'
import RestClient from './restClient'
import logger from '../../logger'
import { RedisClient } from './redisClient'

export default class BaseApiClient {
  constructor(private readonly redisClient: RedisClient) {}

  protected static config(): typeof config.apis.locationsApi {
    throw NotImplemented()
  }

  protected static restClient(token: string): RestClient {
    return new RestClient(this.name, this.config(), token)
  }

  protected apiCall<ReturnType extends object | string, Parameters extends { [k: string]: string }>({
    path,
    queryParams,
    requestType,
    options,
  }: {
    path: string
    queryParams?: string[]
    requestType: 'get' | 'post'
    options?: {
      cacheDuration: number
    }
  }) {
    return async (token: string, parameters: Parameters = {} as never): Promise<ReturnType> => {
      const filledPath = path.replace(/:(\w+)/g, (_, name) => parameters[name])
      const query = queryParams?.length ? Object.fromEntries(queryParams.map(p => [p, parameters[p]])) : undefined

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

      logger.debug(
        `${requestType.toUpperCase()} ${filledPath} with query ${JSON.stringify(query)} - params ${JSON.stringify(parameters)}`,
      )
      const result = await (this.constructor as typeof BaseApiClient).restClient(token)[requestType]<ReturnType>({
        path: filledPath,
        query,
      })

      if (cacheDuration && this.redisClient) {
        logger.debug(`Setting ${filledPath} in redis for ${cacheDuration} seconds, value: ${JSON.stringify(result)}`)

        await this.redisClient.set(filledPath, JSON.stringify(result), { EX: cacheDuration })
      }

      return result
    }
  }
}
