import { Response } from 'express'
import formatConstants from './formatConstants'
import { Location } from '../data/types/locationsApi'

export default function approvalTypeDescription(
  approvalType: string,
  constants: Response['locals']['constants'],
  location: Location,
) {
  switch (approvalType) {
    case 'DRAFT':
      return 'Add new locations to certificate'
    case 'DEACTIVATION':
      return `${formatConstants(
        constants.locationTypes,
        location.locationType,
      )} deactivation (decrease certified working capacity)`
    case 'SIGNED_OP_CAP':
      return 'Change signed operational capacity'
    case 'CELL_MARK':
      return 'Change cell door number'
    case 'CELL_SANITATION':
      return 'Change cell sanitation'
    default:
      break
  }

  return approvalType
}
