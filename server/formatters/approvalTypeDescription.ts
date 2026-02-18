import { Response } from 'express'
import formatConstants from './formatConstants'
import { Location } from '../data/types/locationsApi'
import capFirst from './capFirst'

const approvalTypeMap: { [key: string]: string } = {
  CELL_MARK: 'Change cell door number',
  CELL_SANITATION: 'Change cell sanitation',
  DRAFT: 'Add new locations to certificate',
  SIGNED_OP_CAP: 'Change signed operational capacity',
}

export default function approvalTypeDescription(
  approvalType: string,
  constants: Response['locals']['constants'],
  location: Location,
) {
  if (approvalType === 'DEACTIVATION') {
    const formatted = formatConstants(constants.locationTypes, location.locationType)
    return `${
      formatted === '-' ? capFirst(location.locationType.toLowerCase()) : formatted
    } deactivation (decrease certified working capacity)`
  }

  if (approvalType in approvalTypeMap) {
    return approvalTypeMap[approvalType]
  }

  return approvalType
}
