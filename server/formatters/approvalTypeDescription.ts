import { Response } from 'express'
import formatConstants from './formatConstants'
import { Location } from '../data/types/locationsApi'
import capFirst from './capFirst'
import { CertificationApprovalRequest } from '../data/types/locationsApi/certificationApprovalRequest'

export default function approvalTypeDescription(
  approval: CertificationApprovalRequest,
  constants: Response['locals']['constants'],
  location: Location,
) {
  const { approvalType } = approval

  if (approvalType === 'DEACTIVATION') {
    const formatted = formatConstants(constants.locationTypes, location.locationType)
    return `${
      formatted === '-' ? capFirst(location.locationType.toLowerCase()) : formatted
    } deactivation (decrease certified working capacity)`
  }

  if (approvalType === 'REACTIVATION') {
    const formatted = formatConstants(constants.locationTypes, location.locationType)
    return `${
      formatted === '-' ? capFirst(location.locationType.toLowerCase()) : formatted
    } activation (increase certified working capacity)`
  }

  if (approvalType === 'SPECIALIST_CELL_TYPE') {
    const prefix = approval?.specialistCellTypes?.length ? 'Set' : 'Remove'
    return `${prefix} special cell type`
  }

  return formatConstants(constants.approvalTypes ?? [], approvalType, '<br>', approvalType)
}
