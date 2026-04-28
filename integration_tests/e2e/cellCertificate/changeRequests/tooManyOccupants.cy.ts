import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'
import CertificateLocationFactory from '../../../../server/testutils/factories/certificateLocation'
import CellCertificateChangeRequestsReviewPage from '../../../pages/cellCertificate/changeRequests/review/review'
import CellCertificateChangeRequestsApprovePage from '../../../pages/cellCertificate/changeRequests/review/approve'

const cellLocationId = '7e570000-0000-1000-8000-000000000001'

function buildCapacityChangeRequest(proposedWorkingCapacity: number) {
  return CertificationApprovalRequestFactory.build({
    approvalType: 'CAPACITY_CHANGE',
    locationId: cellLocationId,
    locationKey: 'TST-A-1-001',
    locations: [
      CertificateLocationFactory.build({
        id: cellLocationId,
        pathHierarchy: 'A-1-001',
        currentWorkingCapacity: 3,
        workingCapacity: proposedWorkingCapacity,
        currentMaxCapacity: 3,
        maxCapacity: proposedWorkingCapacity,
        currentCertifiedNormalAccommodation: 3,
        certifiedNormalAccommodation: proposedWorkingCapacity,
      }),
    ],
  })
}

function stubOccupants(count: number) {
  LocationsApiStubber.stub.stubPrisonerLocationsId([
    {
      cellLocation: 'A-1-001',
      prisoners: Array.from({ length: count }, (_, i) => ({
        prisonerNumber: `A123${i}AA`,
        prisonId: 'TST',
        prisonName: 'Test (HMP)',
        cellLocation: 'A-1-001',
        firstName: 'First',
        lastName: 'Last',
        gender: 'Male',
        csra: 'High',
        category: 'C',
        alerts: [],
      })),
    },
  ])
}

context('Cell Certificate - Change Requests - Approve too many occupants', () => {
  beforeEach(() => {
    setupStubs(['RESI__CERT_REVIEWER'])
    cy.signIn()
  })

  context('When the proposed working capacity is below the current occupant count', () => {
    beforeEach(() => {
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(buildCapacityChangeRequest(1))
      stubOccupants(2)

      CellCertificateChangeRequestsReviewPage.goTo('id1')
      const reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      reviewPage.submit({ approve: true })
    })

    it('shows the too-many-occupants page', () => {
      cy.title().should(
        'eq',
        'You can’t approve this change because too many people are occupying the cell - Residential locations',
      )
      cy.get('[data-qa="title-caption"]').should('contain', 'Cell A-1-001')
      cy.get('h1').should('contain', 'You can’t approve this change because too many people are occupying the cell')
      cy.get('main').should(
        'contain',
        "The cell's capacity can't be changed because there are 2 people currently assigned to the cell.",
      )
      cy.get('main').should(
        'contain',
        'You need to contact Test (HMP) and ask them to move someone out of the cell before you can approve this change.',
      )
      cy.get('a:contains("Return to change requests")').should(
        'have.attr',
        'href',
        '/TST/cell-certificate/change-requests',
      )
    })

    it('uses singular wording when there is exactly one occupant', () => {
      stubOccupants(1)
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(buildCapacityChangeRequest(0))

      CellCertificateChangeRequestsReviewPage.goTo('id1')
      const reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      reviewPage.submit({ approve: true })

      cy.get('main').should(
        'contain',
        "The cell's capacity can't be changed because there is 1 person currently assigned to the cell.",
      )
    })

    it('returns to the review page from the back link', () => {
      cy.get('.govuk-back-link').click()
      Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
    })
  })

  context('When the proposed working capacity is at or above the occupant count', () => {
    it('continues to the approve page', () => {
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(buildCapacityChangeRequest(2))
      stubOccupants(2)

      CellCertificateChangeRequestsReviewPage.goTo('id1')
      const reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      reviewPage.submit({ approve: true })

      Page.verifyOnPage(CellCertificateChangeRequestsApprovePage)
    })
  })
})
