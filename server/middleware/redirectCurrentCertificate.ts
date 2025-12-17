// server/middleware/redirectCurrentCertificate.ts
import { NextFunction, Request, Response } from 'express'

export default async function redirectCurrentCertificate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { certificateId } = req.params
  const { systemToken } = req.session
  const { locationsService } = req.services

  const certificate = await locationsService.getCellCertificate(systemToken, certificateId)

  if (certificate.current) {
    res.redirect('./current')
    return
  }

  next()
}
