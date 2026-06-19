import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

const CAPACITY_FIELD_REGEX = /^(CERT_baselineCna|CERT_workingCapacity|CERT_maximumCapacity)$/

/**
 * Extracts capacity field values from a given object.
 *
 * @param obj - The object containing key-value pairs, possibly including capacity fields.
 * @returns An object containing only the capacity fields.
 */
const getCapacityFieldValues = (obj: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([k]) => {
      return CAPACITY_FIELD_REGEX.test(k)
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
 * @param req - The FormWizard request object containing session and form data.
 * @param res - The Express response object containing locals etc.
 * @returns An object mapping field names to string values for the location.
 */
export default function getValues(req: FormWizard.Request, res: Response) {
  const { certifiedNormalAccommodation, workingCapacity, maxCapacity } = res.locals.decoratedLocation.capacity
  const { sessionModel } = req
  const sessionModelJson = sessionModel.toJSON() as Record<string, string>
  const capacitiesValues: Record<string, string> = sessionModel.get('temp-capacitiesValues') || {}
  const errorValues: Record<string, string> = sessionModel.get('errorValues') || {}
  const { values } = req.form

  return {
    [`CERT_baselineCna`]: certifiedNormalAccommodation.toString(),
    [`CERT_workingCapacity`]: workingCapacity.toString(),
    [`CERT_maximumCapacity`]: maxCapacity.toString(),
    // Destructure in this order to prioritise values from the form, then errorValues, then temp-capacitiesValues, then sessionModel
    ...getCapacityFieldValues(sessionModelJson),
    ...getCapacityFieldValues(capacitiesValues),
    ...getCapacityFieldValues(errorValues),
    ...getCapacityFieldValues(values),
    ...getCapacityFieldValues(req.body),
  }
}
