import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'

export default function isSpecialCell(_req: FormWizard.Request, res: Response) {
  const { decoratedLocation } = res.locals
  const { specialistCellTypes } = decoratedLocation.raw
  return specialistCellTypes.some(
    typeKey =>
      res.locals.constants.specialistCellTypes.find(fullType => fullType.key === typeKey).attributes?.affectsCapacity,
  )
}
