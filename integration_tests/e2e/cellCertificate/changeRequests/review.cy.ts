import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import testGovukTable from '../../../support/testGovukTable'
import testGovukSummaryList from '../../../support/testGovukSummaryList'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'
import CellCertificateChangeRequestsReviewPage from '../../../pages/cellCertificate/changeRequests/review/review'
import CellCertificateChangeRequestsApprovePage from '../../../pages/cellCertificate/changeRequests/review/approve'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'
import CellCertificateChangeRequestsRejectPage from '../../../pages/cellCertificate/changeRequests/review/reject'
import CertificateLocationFactory from '../../../../server/testutils/factories/certificateLocation'

context('Cell Certificate - Change Requests - Review', () => {
  context('With RESI__CERT_REVIEWER role', () => {
    beforeEach(() => {
      setupStubs(['RESI__CERT_REVIEWER'])
      cy.signIn()
    })

    let reviewPage: CellCertificateChangeRequestsReviewPage

    context('When the approvalType is DRAFT', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(CertificationApprovalRequestFactory.build())

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review add new locations to certificate request')

        testGovukSummaryList('overview-list-DRAFT', [
          ['Location', 'A'],
          ['Change type', 'Add new locations to certificate'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
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

      it('Displays an error when no option is checked', () => {
        reviewPage.submit({})
        Page.checkForError('approveOrReject', 'Select if you want to approve or reject this change')
      })

      context('When approving', () => {
        let approvePage: CellCertificateChangeRequestsApprovePage
        beforeEach(() => {
          LocationsApiStubber.stub.stubLocationsCertificationLocationApprove()

          reviewPage.submit({ approve: true })
          approvePage = Page.verifyOnPage(CellCertificateChangeRequestsApprovePage)
        })

        it('Displays an error when the legal disclaimer is not checked', () => {
          approvePage.submit({})
          Page.checkForError('confirmation', 'Confirm that the cells meet the certification standards')
        })

        it('Redirects to change requests and displays a banner', () => {
          approvePage.submit({ confirm: true })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cell certificate updated')
          cy.get('.govuk-notification-banner__content p').contains(
            'The establishment has been notified that the change request has been approved.',
          )
        })
      })

      context('When rejecting', () => {
        let rejectPage: CellCertificateChangeRequestsRejectPage
        beforeEach(() => {
          LocationsApiStubber.stub.stubLocationsCertificationLocationReject()

          reviewPage.submit({ approve: false })
          rejectPage = Page.verifyOnPage(CellCertificateChangeRequestsRejectPage)
        })

        it('Displays an error when no explanation is entered', () => {
          rejectPage.submit({})
          Page.checkForError('explanation', 'Explain why you are rejecting this request')
        })

        it('Redirects to change requests and displays a banner', () => {
          rejectPage.submit({ explanation: 'Not good enough' })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Change request rejected')
          cy.get('.govuk-notification-banner__content p').contains(
            'The establishment has been notified that the requested change has been rejected.',
          )
        })
      })
    })

    context('When the approvalType is SIGNED_OP_CAP', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'SIGNED_OP_CAP',
            locationId: null,
            locations: [],
            reasonForChange: 'Needed to change it',
          }),
        )

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review change signed operational capacity request')

        testGovukSummaryList('overview-list-SIGNED_OP_CAP', [
          ['Location', 'A'],
          ['Change type', 'Change signed operational capacity'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('cap-change-table', [['TST', '5 → 9']])
      })

      context('When approving', () => {
        let approvePage: CellCertificateChangeRequestsApprovePage
        beforeEach(() => {
          LocationsApiStubber.stub.stubLocationsCertificationLocationApprove()

          reviewPage.submit({ approve: true })
          approvePage = Page.verifyOnPage(CellCertificateChangeRequestsApprovePage)
        })

        it('Shows the correct page content for signed op cap approval', () => {
          approvePage.backLink().should('be.visible')
          cy.get('[data-qa="title-caption"]').should('contain', 'Test (HMP)')
          cy.get('h1').should('contain', 'You are about to approve a change to the cell certificate')
          cy.get('.govuk-fieldset__legend--m').should('contain', 'Confirm change agreed with capacity management')
          cy.get('.govuk-hint').should(
            'contain',
            'I confirm that this change has been agreed with capacity management.',
          )
          cy.get('label[for="confirmation"]').should('contain', 'I understand and agree with the above statement.')
          approvePage.confirmButton().should('contain', 'Update cell certificate')
          approvePage.cancelLink().should('be.visible')
        })

        it('Does not show the certification standards paragraph', () => {
          cy.get('.govuk-grid-column-two-thirds').should(
            'not.contain',
            'You must confirm that all cells on the certificate meet the required standards',
          )
        })

        it('Displays an error when the confirmation is not checked', () => {
          approvePage.submit({})
          Page.checkForError('confirmation', 'Confirm that the change has been agreed with capacity management')
        })

        it('Redirects to change requests and displays a banner', () => {
          approvePage.submit({ confirm: true })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cell certificate updated')
          cy.get('.govuk-notification-banner__content p').contains(
            'The establishment has been notified that the change request has been approved.',
          )
        })
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

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review change cell door number request')

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

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review change cell sanitation request')

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

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review wing deactivation (decrease certified working capacity) request')

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

    context('When the approvalType is CAPACITY_CHANGE', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'CAPACITY_CHANGE',
            locationId: '7e570000-0000-1000-8000-000000000001',
            locationKey: 'TST-A-1-001',
            reasonForChange: 'Needed to change it',
            locations: [
              CertificateLocationFactory.build({
                id: '7e570000-0000-1000-8000-000000000001',
                pathHierarchy: 'A-1-001',
                certifiedNormalAccommodation: 2,
                currentCertifiedNormalAccommodation: 1,
                workingCapacity: 2,
                currentWorkingCapacity: 1,
                maxCapacity: 3,
                currentMaxCapacity: 2,
              }),
            ],
          }),
        )

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info and approve/reject options', () => {
        cy.get('h1').should('contain', 'Cell capacity request details')

        testGovukSummaryList('overview-list-CAPACITY_CHANGE', [
          ['Location', 'A-1-001'],
          ['Change type', 'Cell capacity'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('capacity-change-table', [['A-1-001', '1 → 2', '1 → 2', '2 → 3']])

        cy.get('input[name="approveOrReject"][type="radio"][value="APPROVE"]').should('exist')
        cy.get('input[name="approveOrReject"][type="radio"][value="REJECT"]').should('exist')
      })

      it('Displays an error when no option is checked', () => {
        reviewPage.submit({})
        Page.checkForError('approveOrReject', 'Select if you want to approve or reject this change')
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

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review wing activation (increase certified working capacity) request')

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
