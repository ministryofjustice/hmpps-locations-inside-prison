import { DeepPartial } from 'fishery'
import canEditCna from './canEditCna'
import { PrisonConfiguration } from '../data/types/locationsApi'

describe('canEditCna', () => {
  let prisonConfiguration: DeepPartial<PrisonConfiguration>

  beforeEach(() => {
    prisonConfiguration = {
      certificationApprovalRequired: 'ACTIVE',
    }
  })

  it("returns false if certificationApprovalRequired !== 'ACTIVE'", () => {
    prisonConfiguration.certificationApprovalRequired = 'INACTIVE'
    expect(canEditCna(prisonConfiguration as PrisonConfiguration)).toBe(false)
  })

  it("returns true if certificationApprovalRequired === 'ACTIVE'", () => {
    expect(canEditCna(prisonConfiguration as PrisonConfiguration)).toBe(true)
  })
})
