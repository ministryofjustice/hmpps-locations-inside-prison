import { Location } from '../../../../server/data/types/locationsApi'

export default function setupStubs(role: string, location: Location) {
  cy.task('reset')
  cy.task('stubSignIn', { roles: [role] })
  cy.task('stubManageUsers')
  cy.task('stubManageUsersMe')
  cy.task('stubManageUsersMeCaseloads')
  cy.task('stubLocationsConstantsAccommodationType')
  cy.task('stubLocationsConstantsConvertedCellType')
  cy.task('stubLocationsConstantsDeactivatedReason')
  cy.task('stubLocationsConstantsLocationType')
  cy.task('stubLocationsConstantsSpecialistCellType')
  cy.task('stubLocationsConstantsUsedForType')
  cy.task('stubLocationsLocationsResidentialSummary', {
    prisonSummary: {
      workingCapacity: 9,
      signedOperationalCapacity: 11,
      maxCapacity: 10,
    },
  })
  cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
    parentLocation: location,
  })
  cy.task('stubLocations', location)
  cy.task('stubPrisonerLocationsId', [])
  cy.task('stubLocationsDeactivateTemporary')
  cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
}
