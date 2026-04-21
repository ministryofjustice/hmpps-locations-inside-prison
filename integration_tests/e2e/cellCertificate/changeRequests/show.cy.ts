import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import testGovukTable from '../../../support/testGovukTable'
import CellCertificateChangeRequestsShowPage from '../../../pages/cellCertificate/changeRequests/show'
import testGovukSummaryList from '../../../support/testGovukSummaryList'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'
import CertificateLocationFactory from '../../../../server/testutils/factories/certificateLocation'

context('Cell Certificate - Change Requests - Show', () => {
  context('With default access', () => {
    beforeEach(() => {
      setupStubs([])
      cy.signIn()
    })

    context('When the approvalType is DRAFT', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(CertificationApprovalRequestFactory.build())

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Add new locations to certificate request details')

        testGovukSummaryList('overview-list-DRAFT', [
          ['Location', 'A'],
          ['Change type', 'Add new locations to certificate'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
          ['Status', 'Awaiting approval'],
        ])

        testGovukTable('wing-table', [
          ['A', ['Normal accommodation', 'Healthcare inpatients'], ['Close Supervision Centre (CSC)', 'Test type']],
        ])

        testGovukTable('locations-table', [
          ['A', '-', '20', '20', '20', '-', '-'],
          ['A-1', '-', '10', '10', '10', '-', '-'],
          ['A-1-001', 'A1-01', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-1-002', 'A1-02', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-1-003', 'A1-03', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-1-004', 'A1-04', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-1-005', 'A1-05', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-2', '-', '10', '10', '10', '-', '-'],
          ['A-2-001', 'A2-01', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-2-002', 'A2-02', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-2-003', 'A2-03', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-2-004', 'A2-04', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
          ['A-2-005', 'A2-05', '2', '2', '2', 'Biohazard / dirty protest cell', 'Yes'],
        ])
      })
    })

    context('When the approvalType is SIGNED_OP_CAP', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'SIGNED_OP_CAP',
            locations: [],
            reasonForChange: 'Needed to change it',
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Change signed operational capacity request details')

        testGovukSummaryList('overview-list-SIGNED_OP_CAP', [
          ['Location', 'A'],
          ['Change type', 'Change signed operational capacity'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
          ['Status', 'Awaiting approval'],
        ])

        testGovukTable('cap-change-table', [['TST', '5 → 9']])
      })
    })

    context('When the approvalType is CELL_MARK', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'CELL_MARK',
            reasonForChange: 'Needed to change it',
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Change cell door number request details')

        testGovukSummaryList('overview-list-CELL_MARK', [
          ['Location', 'A'],
          ['Change type', 'Change cell door number'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('cell-mark-change-table', [['A', 'A-1 → A-1x']])
      })
    })

    context('When the approvalType is CELL_SANITATION', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'CELL_SANITATION',
            reasonForChange: 'Needed to change it',
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Change cell sanitation request details')

        testGovukSummaryList('overview-list-CELL_SANITATION', [
          ['Location', 'A'],
          ['Change type', 'Change cell sanitation'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('cell-sanitation-change-table', [['A', 'No → Yes']])
      })
    })

    context('When the approvalType is DEACTIVATION', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'DEACTIVATION',
            deactivatedReason: 'OTHER',
            deactivationReasonDescription: 'Unidentified energy signature detected',
            locationId: '7e570000-0000-1000-8000-000000000002',
            locationKey: 'TST-A',
            locations: [
              CertificateLocationFactory.build({
                id: '7e570000-0000-1000-8000-000000000002',
                locationType: 'WING',
                certifiedNormalAccommodation: 3,
                currentCertifiedNormalAccommodation: 3,
                workingCapacity: 0,
                maxCapacity: 4,
                currentMaxCapacity: 4,
                currentCellMark: undefined,
                cellMark: undefined,
                inCellSanitation: false,
                level: 1,
                subLocations: [
                  CertificateLocationFactory.build({
                    id: '7e570000-0000-1000-8000-000000000003',
                    locationType: 'LANDING',
                    certifiedNormalAccommodation: 3,
                    currentCertifiedNormalAccommodation: 3,
                    workingCapacity: 0,
                    maxCapacity: 4,
                    currentMaxCapacity: 4,
                    currentCellMark: undefined,
                    cellMark: undefined,
                    inCellSanitation: false,
                    level: 2,
                    subLocations: [
                      CertificateLocationFactory.build({
                        id: '7e570000-0000-1000-8000-000000000004',
                        specialistCellTypes: [],
                        certifiedNormalAccommodation: 3,
                        currentCertifiedNormalAccommodation: 3,
                        workingCapacity: 0,
                        maxCapacity: 4,
                        currentMaxCapacity: 4,
                      }),
                    ],
                  }),
                ],
              }),
            ],
            planetFmReference: '12345678',
            prisonId: 'MDI',
            proposedReactivationDate: '2027-01-10',
            reasonForChange: 'Future cell integrity uncertain',
            workingCapacityChange: -2,
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Wing deactivation (decrease certified working capacity) request details')

        testGovukSummaryList('overview-list-DEACTIVATION', [
          ['Location', 'A'],
          ['Change type', 'Wing deactivation (decrease certified working capacity)'],
          ['Reason', 'Other - Unidentified energy signature detected'],
          ['Estimated reactivation date', '10 January 2027'],
          ['Facilities reference number', '12345678'],
          ['Explanation', 'Future cell integrity uncertain'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('locations-table', [['A-1-001', ' → 0']])
      })
    })

    context('When the approvalType is REACTIVATION', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'REACTIVATION',
            locationId: '7e570000-0000-1000-8000-000000000002',
            locationKey: 'TST-A',
            locations: [
              CertificateLocationFactory.build({
                id: '7e570000-0000-1000-8000-000000000002',
                locationType: 'WING',
                certifiedNormalAccommodation: 6,
                currentCertifiedNormalAccommodation: 2,
                workingCapacity: 4,
                currentWorkingCapacity: 0,
                maxCapacity: 6,
                currentMaxCapacity: 2,
                specialistCellTypes: [],
                currentCellMark: undefined,
                cellMark: undefined,
                inCellSanitation: false,
                level: 1,
                subLocations: [
                  CertificateLocationFactory.build({
                    id: '7e570000-0000-1000-8000-000000000003',
                    locationType: 'LANDING',
                    certifiedNormalAccommodation: 6,
                    currentCertifiedNormalAccommodation: 2,
                    workingCapacity: 4,
                    currentWorkingCapacity: 0,
                    maxCapacity: 6,
                    currentMaxCapacity: 2,
                    specialistCellTypes: [],
                    currentCellMark: undefined,
                    cellMark: undefined,
                    inCellSanitation: false,
                    level: 2,
                    subLocations: [
                      CertificateLocationFactory.build({
                        id: '7e570000-0000-1000-8000-000000000004',
                        specialistCellTypes: [],
                        certifiedNormalAccommodation: 4,
                        currentCertifiedNormalAccommodation: 1,
                        workingCapacity: 2,
                        currentWorkingCapacity: 0,
                        maxCapacity: 4,
                        currentMaxCapacity: 1,
                      }),
                      CertificateLocationFactory.build({
                        id: '7e570000-0000-1000-8000-000000000005',
                        specialistCellTypes: [],
                        certifiedNormalAccommodation: 2,
                        currentCertifiedNormalAccommodation: 1,
                        workingCapacity: 2,
                        currentWorkingCapacity: 0,
                        maxCapacity: 2,
                        currentMaxCapacity: 1,
                        pathHierarchy: 'A-1-002',
                      }),
                    ],
                  }),
                ],
              }),
            ],
            prisonId: 'MDI',
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Wing activation (increase certified working capacity) request details')

        testGovukSummaryList('overview-list-REACTIVATION', [
          ['Location', 'A'],
          ['Change type', 'Wing activation (increase certified working capacity)'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('locations-table', [
          ['A-1-001', '1 → 4', '0 → 2', '1 → 4', 'Biohazard / dirty protest cell → -'],
          ['A-1-002', '1 → 2', '0 → 2', '1 → 2', 'Biohazard / dirty protest cell → -'],
          ['Total', '2 → 6', '0 → 4', '2 → 6'],
        ])
      })
    })
  })
})
