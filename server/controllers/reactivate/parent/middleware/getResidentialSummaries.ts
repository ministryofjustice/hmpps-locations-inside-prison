import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import getLocationResidentialSummary from './getLocationResidentialSummary'
import getPrisonResidentialSummary from '../../../../middleware/getPrisonResidentialSummary'

export default async function getResidentialSummaries(req: FormWizard.Request, res: Response, next: NextFunction) {
  await getLocationResidentialSummary(req, res, null)
  await getPrisonResidentialSummary(req, res, next)
}
