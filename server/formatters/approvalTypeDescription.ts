import { Response } from 'express'
import formatConstants from './formatConstants'
import { Location } from '../data/types/locationsApi'
import capFirst from './capFirst'
import { CertificationApprovalRequest } from '../data/types/locationsApi/certificationApprovalRequest'

function locationTypeDescription(locationType: string, constants: Response['locals']['constants']) {
  if (!locationType) {
    return 'Location'
  }

  const formatted = formatConstants(constants.locationTypes, locationType)
  return formatted === '-' ? capFirst(locationType.toLowerCase()) : formatted
}

export default function approvalTypeDescription(
  approval: CertificationApprovalRequest,
  constants: Response['locals']['constants'],
  location?: Location,
) {
  const { approvalType } = approval
  // Requests from the API carry their location's type. A request still being built in the UI does not, so it comes
  // from the location instead
  const locationType = approval.locationType ?? location?.locationType

  if (approvalType === 'DEACTIVATION') {
    return `${locationTypeDescription(locationType, constants)} deactivation (decrease certified working capacity)`
  }

  if (approvalType === 'REACTIVATION') {
    return `${locationTypeDescription(locationType, constants)} activation (increase certified working capacity)`
  }

  if (approvalType === 'SPECIALIST_CELL_TYPE') {
    const prefix = approval?.specialistCellTypes?.length ? 'Set' : 'Remove'
    return `${prefix} special cell type`
  }

  return formatConstants(constants.approvalTypes ?? [], approvalType, '<br>', approvalType)
}
