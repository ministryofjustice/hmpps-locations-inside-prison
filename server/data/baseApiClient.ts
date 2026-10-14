import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { RedisClient } from './redisClient'

// Stored in place of a response when the API said "not found", so the next caller is told the same without a call
const NOT_FOUND = '{"cachedNotFound":true}'

export default class BaseApiClient extends RestClient {
  // Cached calls that have not finished yet, by cache key. Without this, a page that asks for the same thing many
  // times at once makes every one of those calls, because they all check the cache before the first one fills it
  private readonly inFlight = new Map<string, Promise<unknown>>()

  constructor(
    name: string,
    protected readonly redisClient: RedisClient,
    _config: typeof config.apis.locationsApi,
    authenticationClient: AuthenticationClient,
  ) {
    super(name, _config, logger, authenticationClient)
  }

  protected apiCall<
    ReturnType extends object | string,
    Parameters extends { [k: string]: string },
    Data extends Record<string, unknown> | string[] | string = undefined,
  >({
    path,
    queryParams,
    requestType,
    options,
  }: {
    path: string
    queryParams?: string[]
    requestType: 'get' | 'post' | 'put' | 'delete' | 'patch'
    options?: {
      cacheDuration?: number
      notFoundCacheDuration?: number
    }
  }) {
    const callApi = async (
      token: string,
      filledPath: string,
      query: Record<string, string>,
      parameters: Parameters,
      data: Data,
    ): Promise<ReturnType> => {
      logger.debug(
        `${requestType.toUpperCase()} ${filledPath} with query ${JSON.stringify(query)} - params ${JSON.stringify(parameters)} - data ${JSON.stringify(data)}`,
      )
      return this[requestType]<ReturnType>(
        {
          path: filledPath,
          query,
          data,
        },
        asUser(token),
      )
    }

    const callApiWithCache = async (
      token: string,
      filledPath: string,
      query: Record<string, string>,
      parameters: Parameters,
      data: Data,
    ): Promise<ReturnType> => {
      const cacheDuration = options?.cacheDuration || 0
      const notFoundCacheDuration = options?.notFoundCacheDuration || 0

      if (this.redisClient) {
        logger.debug(`Getting ${filledPath} from redis`)
        const cachedResult = await this.redisClient.get(filledPath)

        if (cachedResult === NOT_FOUND) {
          logger.debug(`Found ${filledPath} in redis as not found`)
          throw Object.assign(new Error('Not Found'), { responseStatus: 404 })
        }

        if (cachedResult) {
          logger.debug(`Found ${filledPath} in redis, value: ${cachedResult}`)

          if (typeof cachedResult === 'string') {
            return JSON.parse(cachedResult)
          }

          return cachedResult as ReturnType
        }
      }

      let result: ReturnType
      try {
        result = await callApi(token, filledPath, query, parameters, data)
      } catch (error) {
        if (notFoundCacheDuration && this.redisClient && (error as SanitisedError)?.responseStatus === 404) {
          logger.debug(`Setting ${filledPath} in redis as not found for ${notFoundCacheDuration} seconds`)
          await this.redisClient.set(filledPath, NOT_FOUND, { EX: notFoundCacheDuration })
        }
        throw error
      }

      if (this.redisClient) {
        logger.debug(`Setting ${filledPath} in redis for ${cacheDuration} seconds, value: ${JSON.stringify(result)}`)

        await this.redisClient.set(filledPath, JSON.stringify(result), { EX: cacheDuration })
      }

      return result
    }

    const func = async (
      token: string,
      parameters: Parameters = {} as never,
      data: Data = undefined,
    ): Promise<ReturnType> => {
      const filledPath = path.replace(/:(\w+)/g, (_, name) => parameters[name])
      const query = queryParams?.length ? Object.fromEntries(queryParams.map(p => [p, parameters[p]])) : undefined

      if (!options?.cacheDuration) {
        return callApi(token, filledPath, query, parameters, data)
      }

      // Callers asking for the same cached item while it is being fetched share that one request
      const inFlight = this.inFlight.get(filledPath)
      if (inFlight) {
        return inFlight as Promise<ReturnType>
      }

      const request: Promise<ReturnType> = callApiWithCache(token, filledPath, query, parameters, data).finally(() => {
        // clearCache may have replaced this request with a newer one, which must stay
        if (this.inFlight.get(filledPath) === request) {
          this.inFlight.delete(filledPath)
        }
      })
      this.inFlight.set(filledPath, request)

      return request
    }
    func.clearCache = async (parameters: Parameters = {} as never) => {
      const filledPath = path.replace(/:(\w+)/g, (_, name) => parameters[name])
      this.inFlight.delete(filledPath)
      if (this.redisClient) {
        await this.redisClient.del(filledPath)
      }
    }
    return func as typeof func & { clearCache: typeof func.clearCache }
  }
}
