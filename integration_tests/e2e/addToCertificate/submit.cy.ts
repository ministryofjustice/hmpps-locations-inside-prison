import setupStubs, { draftCell1, draftCell2, draftLanding, draftWing } from './setupStubs'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import { Location } from '../../../server/data/types/locationsApi'
import formatConstants from '../../../server/formatters/formatConstants'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import testGovukTable from '../../support/testGovukTable'
import testGovukSummaryList from '../../support/testGovukSummaryList'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'

function testRequests(
  page: SubmitCertificationApprovalRequestPage,
  requests: [
    { wing: Location; allLocations: Location[] },
    { oldOpCap: number; newOpCap: number; explanation: string }?,
  ],
) {
  const draftRequest = requests[0]

  if (requests.length > 1) {
    page.request('DRAFT').find('h2').should('contain', 'Change 1 - Add new locations to certificate')
    page.request('DRAFT').find('h3').should('contain', 'Proposed changes to the certificate')
  } else {
    page.request('DRAFT').find('h2').should('contain', 'Proposed changes to the certificate')
    page.request('DRAFT').find('h3').should('contain', 'New wing usage')
    page.request('DRAFT').find('h3').should('contain', 'New locations')
  }

  testGovukTable('wing-table', [
    [draftRequest.wing.pathHierarchy, 'Normal accommodation', 'Close Supervision Centre (CSC)'],
  ])

  testGovukTable(
    'locations-table',
    draftRequest.allLocations.map(l => [
      l.pathHierarchy,
      l.cellMark || '-',
      l.pendingChanges.certifiedNormalAccommodation.toString(),
      l.pendingChanges.workingCapacity.toString(),
      l.pendingChanges.maxCapacity.toString(),
      l.specialistCellTypes?.length
        ? formatConstants(
            [
              {
                key: 'NORMAL_ACCOMMODATION',
                description: 'Normal accommodation',
              },
              {
                key: 'BIOHAZARD_DIRTY_PROTEST',
                description: 'Biohazard / dirty protest cell',
              },
            ],
            l.specialistCellTypes,
          )
        : '-',
      { undefined: '-', true: 'Yes', false: 'No' }[`${l.inCellSanitation}`],
    ]),
  )

  if (requests.length === 1) {
    page.request('SIGNED_OP_CAP').should('not.exist')
  } else {
    const capRequest = requests[1]

    testGovukSummaryList('overview-list-SIGNED_OP_CAP', [
      ['Location', 'TST'],
      ['Change type', 'Change signed operational capacity'],
      ['Explanation', capRequest.explanation],
    ])

    testGovukTable('cap-change-table', [['TST', `${capRequest.oldOpCap} → ${capRequest.newOpCap}`]])
  }
}

context('Add To Certificate - Submit Certification Approval Request', () => {
  let page: SubmitCertificationApprovalRequestPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
    })

    context('When also updating signed op cap', () => {
      beforeEach(() => {
        page = goToSubmitCertificationApprovalRequest('7e570000-0000-1000-8000-000000000200', {
          opCap: 280,
          explanation: 'Dave told me to do it',
        })
      })

      it('displays the correct information', () => {
        testRequests(page, [
          { wing: draftWing, allLocations: [draftWing, draftLanding, draftCell1, draftCell2] },
          { oldOpCap: 100, newOpCap: 280, explanation: 'Dave told me to do it' },
        ])
      })

      it('displays the correct validation error when the checkbox is not checked', () => {
        page.submit({})

        Page.checkForError(
          'submit-certification-approval-request_confirmation',
          'Confirm that the cells meet the certification standards',
        )
      })

      it('submits when the checkbox is checked', () => {
        page.submit({ confirm: true })
        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change requests sent')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have submitted 2 requests to update the cell certificate.',
        )
      })

      it('has a back link to update signed op cap details', () => {
        page.backLink().click()
        Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
      })

      it('has a cancel link to the view location show page', () => {
        page.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })

    context('When not updating signed op cap', () => {
      beforeEach(() => {
        page = goToSubmitCertificationApprovalRequest('7e570000-0000-1000-8000-000000000200')
      })

      it('displays the correct information', () => {
        testRequests(page, [{ wing: draftWing, allLocations: [draftWing, draftLanding, draftCell1, draftCell2] }])
      })

      it('displays the correct validation error when the checkbox is not checked', () => {
        page.submit({})

        Page.checkForError(
          'submit-certification-approval-request_confirmation',
          'Confirm that the cells meet the certification standards',
        )
      })

      it('submits when the checkbox is checked', () => {
        page.submit({ confirm: true })
        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request sent')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have submitted a request to update the cell certificate.',
        )
      })

      it('has a back link to update signed op cap is update needed', () => {
        page.backLink().click()
        Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
      })

      it('has a cancel link to the view location show page', () => {
        page.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })
  })
})
