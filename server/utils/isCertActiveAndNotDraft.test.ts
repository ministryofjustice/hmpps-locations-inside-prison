import isCertActiveAndNotDraft from './isCertActiveAndNotDraft'
import { LocationStatus, PrisonConfiguration } from '../data/types/locationsApi'
import LocationFactory from '../testutils/factories/location'
import { DecoratedLocation } from '../decorators/decoratedLocation'

describe('isCertActiveAndNotDraft', () => {
  it.each([
    ['INACTIVE', 'DRAFT', false],
    ['ACTIVE', 'DRAFT', false],
    ['INACTIVE', 'ACTIVE', false],
    ['ACTIVE', 'ACTIVE', true],
  ])('with cert %s and status %s returns %s', (certStatus, locationStatus, result) => {
    const prisonConfiguration: PrisonConfiguration = {
      certificationApprovalRequired: certStatus,
    } as PrisonConfiguration
    const location = LocationFactory.build({ status: locationStatus as LocationStatus })
    expect(isCertActiveAndNotDraft({ prisonConfiguration, decoratedLocation: location as DecoratedLocation })).toBe(
      result,
    )
  })
})
