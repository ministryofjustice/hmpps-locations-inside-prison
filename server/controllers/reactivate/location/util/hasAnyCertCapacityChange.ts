import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

/**
 * Checks if any cell in the current context has a change in any certificate capacity value.
 *
 * Compares the working capacity, maximum capacity, certified normal accommodation,
 * and specialist cell types
 * in the modifiedLocationMap for each cell against the cell's currentCellCertificate values
 * (defaulting to 0 for numeric fields and an empty array for specialistCellTypes if no
 * currentCellCertificate is present).
 * Returns true if any cell has a difference in any of these values, otherwise false.
 *
 * @param _req - The FormWizard request object (unused).
 * @param res - The Express response object, expected to have modifiedLocationMap and cells/decoratedCells in locals.
 * @returns True if any cell has a cert capacity change, false otherwise.
 */
export default function hasAnyCertCapacityChange(_req: FormWizard.Request, res: Response) {
  const { modifiedLocationMap } = res.locals
  const cells = res.locals.cells || res.locals.decoratedCells || []

  return cells.some(cell => {
    const modified = modifiedLocationMap[cell.id]
    const cert = cell.currentCellCertificate

    const workingCapacityChanged = modified.oldWorkingCapacity !== (cert?.workingCapacity ?? 0)
    const maxCapacityChanged = modified.capacity.maxCapacity !== (cert?.maxCapacity ?? 0)
    const cnaChanged = modified.capacity.certifiedNormalAccommodation !== (cert?.certifiedNormalAccommodation ?? 0)
    // TODO: adjust this so that it follows the correct rules around cell type certification (swapping to special, etc)
    const specialistCellTypesChanged =
      JSON.stringify([...(modified.specialistCellTypes ?? [])].sort()) !==
      JSON.stringify([...(cert?.specialistCellTypes ?? [])].sort())

    return workingCapacityChanged || maxCapacityChanged || cnaChanged || specialistCellTypesChanged
  })
}
