import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { Location } from '../../../../data/types/locationsApi'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'

/**
 * Regex to match capacity field keys in the format: baselineCna-<id>, workingCapacity-<id>, or maximumCapacity-<id>.
 */
const CAPACITY_FIELD_REGEX = /^(baselineCna|workingCapacity|maximumCapacity)-(.+)$/

/**
 * Extracts capacity field values for a specific location ID from a given object.
 *
 * @param obj - The object containing key-value pairs, possibly including capacity fields.
 * @param id - The location ID to filter for.
 * @returns An object containing only the capacity fields for the given location ID.
 */
const getCapacityFieldValues = (obj: Record<string, unknown>, id: string) => {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([k]) => {
      const matches = k.match(CAPACITY_FIELD_REGEX)

      return matches && matches[2] === id
    }),
  )
}

/**
 * Returns a map of capacity field values for a given location, prioritising values from the session and form.
 *
 * The returned object always includes the baselineCna, workingCapacity, and maximumCapacity fields for the location,
 * using the following precedence for values (highest to lowest):
 *   1. Values from the form
 *   2. Values from errorValues in the session
 *   3. Values from temp-capacitiesValues in the session
 *   4. Values from the session model (saved form values from previous steps)
 *   5. The location's own values (as fallback)
 *
 * @param location - The Location or DecoratedLocation to get values for.
 * @param req - The FormWizard request object containing session and form data.
 * @returns An object mapping field names to string values for the location.
 */
export function getValuesForLocation(location: Location | DecoratedLocation, req: FormWizard.Request) {
  const { id } = location
  const { sessionModel } = req
  const sessionModelJson = sessionModel.toJSON() as Record<string, string>
  const capacitiesValues: Record<string, string> = sessionModel.get('temp-capacitiesValues') || {}
  const errorValues: Record<string, string> = sessionModel.get('errorValues') || {}
  const { values } = req.form

  return {
    [`baselineCna-${id}`]: location.capacity.certifiedNormalAccommodation.toString(),
    [`workingCapacity-${id}`]: location.oldWorkingCapacity.toString(),
    [`maximumCapacity-${id}`]: location.capacity.maxCapacity.toString(),
    // Destructure in this order to prioritise values from the form, then errorValues, then temp-capacitiesValues, then sessionModel
    ...getCapacityFieldValues(sessionModelJson, id),
    ...getCapacityFieldValues(capacitiesValues, id),
    ...getCapacityFieldValues(errorValues, id),
    ...getCapacityFieldValues(values, id),
  }
}

/**
 * Returns a map of all capacity field values for all cells the locals.
 *
 * @param req - The FormWizard request object.
 * @param res - The Express response object, with cells or decoratedCells in locals.
 * @returns An object mapping all relevant field names to their string values for all cells in the locals.
 */
export function getValues(req: FormWizard.Request, res: Response) {
  const cells = res.locals.cells || res.locals.decoratedCells || []

  return cells.reduce(
    (values, cell) => ({
      ...values,
      ...getValuesForLocation(cell, req),
    }),
    {},
  )
}
