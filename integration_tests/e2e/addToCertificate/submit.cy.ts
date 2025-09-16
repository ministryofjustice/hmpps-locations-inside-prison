import setupStubs, { draftCell1, draftCell2, draftLanding, draftWing } from './setupStubs'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import { Location } from '../../../server/data/types/locationsApi'
import formatConstants from '../../../server/formatters/formatConstants'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'

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

  const wingTableCell = (i: number) => page.request('DRAFT').find('[data-qa=wing-table] .govuk-table__cell').eq(i)
  wingTableCell(0).should('contain', draftRequest.wing.pathHierarchy)
  wingTableCell(1).should('contain', 'Normal accommodation')
  wingTableCell(2).should('contain', 'Close Supervision Centre (CSC)')

  const locationTableRow = (rowIndex: number) =>
    page.request('DRAFT').find('[data-qa=locations-table] .govuk-table__body .govuk-table__row').eq(rowIndex)
  const locationCell = (rowIndex: number, cellIndex: number) => locationTableRow(rowIndex).find('th, td').eq(cellIndex)
  for (let i = 0; i < draftRequest.allLocations.length; i += 1) {
    const location = draftRequest.allLocations[i]
    locationCell(i, 0).should('contain', location.pathHierarchy)
    locationCell(i, 1).should('contain', location.cellMark || '-')
    locationCell(i, 2).should('contain', location.pendingChanges.certifiedNormalAccommodation)
    locationCell(i, 3).should('contain', location.pendingChanges.workingCapacity)
    locationCell(i, 4).should('contain', location.pendingChanges.maxCapacity)
    locationCell(i, 5).should(
      'contain',
      location.specialistCellTypes?.length
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
            location.specialistCellTypes,
          )
        : '-',
    )
    if (location.inCellSanitation === undefined) {
      locationCell(i, 6).should('contain', '-')
    } else {
      locationCell(i, 6).should('contain', location.inCellSanitation ? 'Yes' : 'No')
    }
  }

  if (requests.length === 1) {
    page.request('SIGNED_OP_CAP').should('not.exist')
  } else {
    const capRequest = requests[1]

    const overviewListRow = (rowIndex: number) =>
      page.request('SIGNED_OP_CAP').find('[data-qa="overview-list"] .govuk-summary-list__row').eq(rowIndex)
    overviewListRow(0).find('.govuk-summary-list__value').should('contain', 'TST')
    overviewListRow(1).find('.govuk-summary-list__value').should('contain', 'Change signed operational capacity')
    overviewListRow(2).find('.govuk-summary-list__value').should('contain', capRequest.explanation)

    page
      .request('SIGNED_OP_CAP')
      .find('[data-qa="cap-change-table"] .govuk-table__cell')
      .should('contain', `${capRequest.oldOpCap} → ${capRequest.newOpCap}`)
  }
}

context('Add To Certificate - Submit Certification Approval Request', () => {
  let page: SubmitCertificationApprovalRequestPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
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

        page.checkForError(
          'submit-certification-approval-request_cellsMeetStandards',
          'Confirm that the cells meet the certification standards',
        )
      })

      it('submits when the checkbox is checked', () => {
        page.submit({ confirm: true })
        // TODO: change this when certification approval requests page is added
        Page.verifyOnPage(ViewLocationsShowPage)

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

        page.checkForError(
          'submit-certification-approval-request_cellsMeetStandards',
          'Confirm that the cells meet the certification standards',
        )
      })

      it('submits when the checkbox is checked', () => {
        page.submit({ confirm: true })
        // TODO: change this when certification approval requests page is added
        Page.verifyOnPage(ViewLocationsShowPage)

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
