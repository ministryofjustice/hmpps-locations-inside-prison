import { HttpError } from 'http-errors'

export default class BaseApiError extends Error {
  readonly originalError: HttpError

  readonly status: number

  constructor(originalError: HttpError) {
    super(originalError.message)

    this.status = originalError.status
    this.originalError = originalError
  }
}
