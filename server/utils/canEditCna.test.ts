import { DeepPartial } from 'fishery'
import canEditCna from './canEditCna'
import { Location, PrisonConfiguration } from '../data/types/locationsApi'
import LocationFactory from '../testutils/factories/location'

describe('canEditCna', () => {
  let prisonConfiguration: DeepPartial<PrisonConfiguration>
  let location: Location

  beforeEach(() => {
    prisonConfiguration = {
      certificationApprovalRequired: 'ACTIVE',
    }
    location = LocationFactory.build({
      status: 'DRAFT',
    })
  })

  it("returns false if certificationApprovalRequired !== 'ACTIVE'", () => {
    prisonConfiguration.certificationApprovalRequired = 'INACTIVE'
    expect(canEditCna(prisonConfiguration as PrisonConfiguration, location as Location)).toBe(false)
  })

  it("returns false if location.status !== 'DRAFT'", () => {
    location.status = 'ACTIVE'
    expect(canEditCna(prisonConfiguration as PrisonConfiguration, location as Location)).toBe(false)
  })

  it("returns true if certificationApprovalRequired === 'ACTIVE' && location.status === 'DRAFT'", () => {
    expect(canEditCna(prisonConfiguration as PrisonConfiguration, location as Location)).toBe(true)
  })
})
