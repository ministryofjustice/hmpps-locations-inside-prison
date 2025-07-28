import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'

export default class CellDetails extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { locationId, prisonId, decoratedResidentialSummary } = res.locals
    const localName = req.sessionModel.get<string>('localName')
    const locationName =
      localName ||
      `${decoratedResidentialSummary.location.pathHierarchy}-${req.sessionModel.get<string>('locationCode')}`
    locals.locationType = req.sessionModel.get<string>('locationType')
    locals.title = 'Enter cell details'
    locals.titleCaption = `Create cells on ${locals.locationType.toLowerCase()} ${locationName}`

    locals.backLink = backUrl(req, {
      fallbackUrl: `/create-new/${locationId || prisonId}/details`,
    })
    locals.cancelLink = `/view-and-update-locations/${[prisonId, locationId].filter(i => i).join('/')}`

    return locals
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    return next()
  }
}
