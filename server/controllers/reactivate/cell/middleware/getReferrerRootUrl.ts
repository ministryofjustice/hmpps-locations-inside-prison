import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { isValidUUID } from '../../../../utils/isValidUUID'

export default function getReferrerRootUrl(req: FormWizard.Request, res: Response, next: NextFunction) {
  const referrerFlow = req.sessionModel.get<string>('referrerFlow')
  const referrerPrisonId = req.sessionModel.get<string>('referrerPrisonId')
  const referrerLocationId = req.sessionModel.get<string>('referrerLocationId')

  if (referrerFlow === 'parent' && isValidUUID(referrerLocationId)) {
    res.locals.referrerRootUrl = `/reactivate/parent/${referrerLocationId}?select=1`
  } else if (referrerFlow === 'inactive-cells') {
    res.locals.referrerRootUrl = `/inactive-cells/${encodeURIComponent(referrerPrisonId)}`
    if (isValidUUID(referrerLocationId)) {
      res.locals.referrerRootUrl += `/${referrerLocationId}`
    }
  } else {
    const { id: locationId, prisonId } = res.locals.decoratedLocation
    res.locals.referrerRootUrl = `/view-and-update-locations/${prisonId}/${locationId}`
  }

  next()
}
