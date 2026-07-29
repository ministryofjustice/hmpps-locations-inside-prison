import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { isValidUUID } from '../../../../utils/isValidUUID'
import paths from '../../../../utils/paths'

export default function getReferrerRootUrl(req: FormWizard.Request, res: Response, next: NextFunction) {
  const referrerFlow = req.sessionModel.get<string>('referrerFlow')
  const referrerPrisonId = req.sessionModel.get<string>('referrerPrisonId')
  const referrerLocationId = req.sessionModel.get<string>('referrerLocationId')

  const locationId = isValidUUID(referrerLocationId) ? referrerLocationId : undefined

  if (referrerFlow === 'parent' && locationId) {
    res.locals.referrerRootUrl = `${paths.location.reactivate.parent(referrerPrisonId, locationId)}?select=1`
  } else if (referrerFlow === 'inactive-cells') {
    res.locals.referrerRootUrl = paths.location.inactiveCells(referrerPrisonId, locationId)
  } else {
    res.locals.referrerRootUrl = paths.location.view(res.locals.decoratedLocation)
  }

  next()
}
