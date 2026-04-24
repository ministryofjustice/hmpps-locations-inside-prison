import { PrisonConfiguration } from '../data/types/locationsApi'

export default function canEditCna(prisonConfiguration: PrisonConfiguration) {
  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE'
}
