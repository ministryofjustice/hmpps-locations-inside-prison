import { type NextFunction, Request, type Response } from 'express'
import { Services } from '../services'

export default function addServicesToRequest(services: Services) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    req.services = services

    next()
  }
}
