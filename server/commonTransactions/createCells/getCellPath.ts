import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default function getCellPath(req: FormWizard.Request, res: Response, index?: number) {
  const { pathHierarchy } = res.locals.decoratedResidentialSummary.location
  const cellNumber =
    index !== undefined ? req.sessionModel.get<string>(`create-cells_cellNumber${index}`).padStart(3, '0') : undefined
  const newLocationCode = req.sessionModel.get<string>(`locationCode`)

  return [pathHierarchy, newLocationCode, cellNumber].filter(s => s).join('-')
}
