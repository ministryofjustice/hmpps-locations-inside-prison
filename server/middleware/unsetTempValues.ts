import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default function unsetTempValues(req: FormWizard.Request, _res: Response, next: NextFunction) {
  const modelData = req.sessionModel.toJSON()
  Object.keys(modelData)
    .filter(key => key.startsWith('temp-'))
    .forEach(key => req.sessionModel.unset(key))

  next()
}
