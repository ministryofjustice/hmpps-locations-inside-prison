import type { ResponseError } from 'superagent'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'

export default function sanitise(error: ResponseError): SanitisedError {
  const e = new Error() as SanitisedError
  e.message = error.message
  e.stack = error.stack
  if (error.response) {
    e.text = error.response.text
    e.headers = error.response.headers
    e.data = error.response.body
  }
  return e
}
