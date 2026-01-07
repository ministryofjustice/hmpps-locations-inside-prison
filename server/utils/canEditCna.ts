import { Location, PrisonConfiguration } from '../data/types/locationsApi'
import { DecoratedLocation } from '../decorators/decoratedLocation'

export default function canEditCna(prisonConfiguration: PrisonConfiguration, location: Location | DecoratedLocation) {
  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && location.status === 'DRAFT'
}
