import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { validate as validateUUID } from 'uuid'

export default function getReferrerRootUrl(req: FormWizard.Request, res: Response, next: NextFunction) {
  const referrerFlow = req.sessionModel.get<string>('referrerFlow')
  const referrerPrisonId = req.sessionModel.get<string>('referrerPrisonId')
  const referrerLocationId = req.sessionModel.get<string>('referrerLocationId')

  if (referrerFlow === 'parent' && validateUUID(referrerLocationId)) {
    res.locals.referrerRootUrl = `/reactivate/parent/${referrerLocationId}?select=1`
  } else if (referrerFlow === 'inactive-cells') {
    res.locals.referrerRootUrl = `/inactive-cells/${encodeURIComponent(referrerPrisonId)}`
    if (validateUUID(referrerLocationId)) {
      res.locals.referrerRootUrl += `/${referrerLocationId}`
    }
  } else {
    const { id: locationId, prisonId } = res.locals.location
    res.locals.referrerRootUrl = `/view-and-update-locations/${prisonId}/${locationId}`
  }

  next()
}
