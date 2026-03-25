import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

/**
 * Checks if any cell in the current context has a change in working capacity.
 *
 * Compares the oldWorkingCapacity in the modifiedLocationMap for each cell
 * against the cell's currentCellCertificate.workingCapacity (or 0 if not present).
 * Returns true if any cell has a difference, otherwise false.
 *
 * @param _req - The FormWizard request object (unused).
 * @param res - The Express response object, expected to have modifiedLocationMap and cells/decoratedCells in locals.
 * @returns True if any cell has a working capacity change, false otherwise.
 */
export default function hasAnyWorkingCapacityChange(_req: FormWizard.Request, res: Response) {
  const { modifiedLocationMap } = res.locals
  const cells = res.locals.cells || res.locals.decoratedCells || []

  return cells.some(
    cell => modifiedLocationMap[cell.id].oldWorkingCapacity !== (cell.currentCellCertificate?.workingCapacity ?? 0),
  )
}
