import { RequestHandler } from 'express'
import { Services } from '../services'

export default function addServicesToRequest(services: Services): RequestHandler {
  return async (req, _res, next) => {
    req.services = services

    next()
  }
}
