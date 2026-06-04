import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SetCellTypeTypePage from '../../pages/setCellType/type'
import SetCellTypeNormalPage from '../../pages/setCellType/normal'
import SetCellTypeSpecialPage from '../../pages/setCellType/special'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import ReviewCellCapacityPage from '../../pages/removeCellType/review'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'

const prisonerLocations = [
  {
    cellLocation: '1-1-001',
    prisoners: [
      {
        prisonerNumber: 'A1234AA',
        prisonId: 'TST',
        prisonName: 'HMP Leeds',
        cellLocation: '1-1-001',
        firstName: 'Dave',
        lastName: 'Jones',
        gender: 'Male',
        csra: 'High',
        category: 'C',
        alerts: [
          {
            alertType: 'X',
            alertCode: 'XA',
            active: true,
            expired: false,
          },
        ],
      },
      {
        prisonerNumber: 'B1234BB',
        prisonId: 'TST',
        prisonName: 'HMP Leeds',
        cellLocation: '1-1-001',
        firstName: 'Horatio',
        lastName: 'McBubblesworth',
        gender: 'Male',
        csra: 'High',
        category: 'C',
        alerts: [
          {
            alertType: 'X',
            alertCode: 'XA',
            active: true,
            expired: false,
          },
        ],
      },
    ],
  },
]

context('Set cell type', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: null,
        specialistCellTypes: [],
      })
      location.currentCellCertificate.specialistCellTypes = []
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    it('does not show the remove link on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setCellTypeLink().should('not.exist')
    })

    it('redirects user to sign in page if accessed directly', () => {
      cy.signIn()
      SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: null,
        specialistCellTypes: [],
      })
      location.currentCellCertificate.specialistCellTypes = []
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubUpdateSpecialistCellTypes')
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocations', location)
      cy.task('stubLocationsCertificationRequestApprovalsPrison', [])
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.task('stubPrisonerLocationsId', prisonerLocations)
      cy.task('stubLocationsRequestSpecialistCellTypeChange')
      cy.task('stubLocationsCertificationPrisonSignedOpCapChange')
    })

    context('when the location does not yet have a specific type', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          leafLevel: true,
          specialistCellTypes: [],
          localName: null,
        })
        location.currentCellCertificate.specialistCellTypes = []
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.signIn()
      })

      it('does not show the set cell type link when the cell is inactive', () => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          active: false,
          leafLevel: true,
          specialistCellTypes: [],
          localName: null,
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setCellTypeLink().should('not.exist')
      })

      it('can be accessed by clicking the set cell type link on the show location page', () => {
        ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setCellTypeLink().click()

        Page.verifyOnPage(SetCellTypeTypePage)
      })

      it('has the correct main heading and a caption showing the cell description', () => {
        SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        Page.verifyOnPage(SetCellTypeTypePage)

        cy.get('h1').contains('Is it a normal or special cell type?')
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('shows the correct validation error when no type is selected', () => {
        SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const page = Page.verifyOnPage(SetCellTypeTypePage)

        page.submit({})

        Page.checkForError('set-cell-type_accommodationType', 'Select if it is a normal or special cell type')
      })

      context('normal type', () => {
        it('shows the correct validation error when no normal type is selected', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ normal: true })
          const normalPage = Page.verifyOnPage(SetCellTypeNormalPage)

          normalPage.submit({ types: [] })

          Page.checkForError('set-cell-type_normalCellTypes', 'Select a cell type')
        })

        it('shows the success banner when the change is complete', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ normal: true })
          const normalPage = Page.verifyOnPage(SetCellTypeNormalPage)

          normalPage.submit({ types: ['NORMAL_ACCOMMODATION'] })

          Page.verifyOnPage(ViewLocationsShowPage)
          Page.checkForSuccessBanner('Cell type set', 'You have set a cell type for A-1-001.')
        })
      })

      context('special type', () => {
        beforeEach(() => {
          ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
          const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
          viewLocationsShowPage.setCellTypeLink().click()
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)
          typePage.submit({ special: true })
        })

        it('shows the cert disclaimer page', () => {
          // eslint-disable-next-line no-new
          new CertChangeDisclaimerPage('Setting special cell type')
        })

        it('shows the correct validation error when no special type is selected', () => {
          const disclaimerPage = new CertChangeDisclaimerPage('Setting special cell type')
          disclaimerPage.submit()

          const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
          specialPage.submit({ type: '' })

          Page.checkForError('set-cell-type_specialistCellTypes', 'Select a cell type')
        })

        it('progresses to the review cell capacity page', () => {
          const disclaimerPage = new CertChangeDisclaimerPage('Setting special cell type')
          disclaimerPage.submit()

          const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
          specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

          Page.verifyOnPage(ReviewCellCapacityPage)
        })

        describe('cell capacity validations', () => {
          it('shows the correct validation errors', () => {
            const disclaimerPage = new CertChangeDisclaimerPage('Setting special cell type')
            disclaimerPage.submit()

            const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
            specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

            const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear()
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_workingCapacity', 'Enter a working capacity')

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear().type('100')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_workingCapacity', 'Working capacity cannot be more than 99')

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('4')
            reviewCellCapacityPage.workingCapacityInput().clear().type('hello')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_workingCapacity', 'Working capacity must be a number')

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('3')
            reviewCellCapacityPage.workingCapacityInput().clear().type('4')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError(
              'set-cell-type_workingCapacity',
              'Working capacity cannot be more than the maximum capacity',
            )

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear()
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_maxCapacity', 'Enter a maximum capacity')

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('100')
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_maxCapacity', 'Maximum capacity cannot be more than 99')

            reviewCellCapacityPage.cnaInput().clear().type('2')
            reviewCellCapacityPage.maxCapacityInput().clear().type('hello')
            reviewCellCapacityPage.workingCapacityInput().clear().type('2')
            reviewCellCapacityPage.continueButton().click()

            Page.checkForError('set-cell-type_maxCapacity', 'Maximum capacity must be a number')

            reviewCellCapacityPage.cnaInput().clear().type('1')
            reviewCellCapacityPage.maxCapacityInput().clear().type('1')
            reviewCellCapacityPage.workingCapacityInput().clear().type('1')
            reviewCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains(
              'Maximum capacity cannot be less than the number of people currently occupying the cell',
            )
            cy.get('#set-cell-type_maxCapacity-error').contains(
              'Maximum capacity cannot be less than the number of people currently occupying the cell',
            )
          })
        })

        const submitCapacityUpdate = () => {
          const disclaimerPage = new CertChangeDisclaimerPage('Setting special cell type')
          disclaimerPage.submit()
          const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
          specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

          const reviewCellCapacityPage = Page.verifyOnPage(ReviewCellCapacityPage)
          reviewCellCapacityPage.cnaInput().clear().type('0')
          reviewCellCapacityPage.maxCapacityInput().clear().type('2')
          reviewCellCapacityPage.workingCapacityInput().clear().type('0')
          reviewCellCapacityPage.continueButton().click()
        }

        it('progresses to the op cap update needed page', () => {
          submitCapacityUpdate()

          Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
        })

        it('progresses to the cert update details page when no is selected', () => {
          submitCapacityUpdate()

          const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
          isUpdateNeeded.submit({ updateNeeded: false })

          Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        })

        it('flows through to the cert update details page when yes is selected', () => {
          submitCapacityUpdate()

          const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
          isUpdateNeeded.submit({ updateNeeded: true })
          const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)

          detailsPage.submit({ opCap: 9, explanation: 'Op cap update was needed' })
          Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        })

        context('Without a signed op cap change', () => {
          let page: SubmitCertificationApprovalRequestPage

          beforeEach(() => {
            submitCapacityUpdate()
            const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
            isUpdateNeeded.submit({ updateNeeded: false })
            page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
          })

          it('has a cancel link', () => {
            page.cancelLink().click()

            Page.verifyOnPage(ViewLocationsShowPage)
          })

          it('has a back link', () => {
            page.backLink().click()

            Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
          })

          context('validation errors', () => {
            it('displays the correct error(s) for required', () => {
              page.submit({})

              Page.checkForError(
                'set-cell-type_submit-certification-approval-request_confirmation',
                'Confirm that the cells meet the certification standards',
              )
            })
          })

          it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
            page.submit({
              confirm: true,
            })

            Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

            Page.checkForSuccessBanner(
              'Change request sent',
              'You have submitted a request to update the cell certificate.',
            )
          })

          it('displays the correct change summary', () => {
            const rowsSelector = '[data-qa="overview-list-SPECIALIST_CELL_TYPE"] .govuk-summary-list__value'
            cy.get(rowsSelector).eq(0).contains('A-1-001')
            cy.get(rowsSelector).eq(1).contains('Specialist cell type')

            const cellTypeTableSelector = '[data-qa="specialist-cell-type-table"]'
            const cellTypeHeaderSelector = `${cellTypeTableSelector} .govuk-table__header`
            cy.get(cellTypeHeaderSelector).eq(0).contains('Location')
            cy.get(cellTypeHeaderSelector).eq(1).contains('Baseline CNA')
            cy.get(cellTypeHeaderSelector).eq(2).contains('Certified working capacity')
            cy.get(cellTypeHeaderSelector).eq(3).contains('Cell type')

            const cellTypeDataSelector = `${cellTypeTableSelector} .govuk-table__cell`
            cy.get(cellTypeDataSelector).eq(0).contains('A-1-001')
            cy.get(cellTypeDataSelector).eq(1).contains('2 → 0')
            cy.get(cellTypeDataSelector).eq(2).contains('2 → 0')
            cy.get(cellTypeDataSelector).eq(3).contains('None → Biohazard / dirty protest cell')
          })
        })

        context('With a signed op cap change', () => {
          let page: SubmitCertificationApprovalRequestPage

          beforeEach(() => {
            submitCapacityUpdate()
            const isUpdateNeeded = Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
            isUpdateNeeded.submit({ updateNeeded: true })
            const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
            detailsPage.submit({ opCap: 9, explanation: 'Op cap update was needed' })
            page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
          })

          it('has a cancel link', () => {
            page.cancelLink().click()

            Page.verifyOnPage(ViewLocationsShowPage)
          })

          it('has a back link', () => {
            page.backLink().click()

            Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
          })

          it('displays the correct change summaries', () => {
            cy.get('[data-qa="approval-request-SPECIALIST_CELL_TYPE"] h2').contains('Change 1 - Specialist cell type')
            const rowsSelector = '[data-qa="overview-list-SPECIALIST_CELL_TYPE"] .govuk-summary-list__value'
            cy.get(rowsSelector).eq(0).contains('A-1-001')
            cy.get(rowsSelector).eq(1).contains('Specialist cell type')

            const cellTypeTableSelector = '[data-qa="specialist-cell-type-table"]'
            const cellTypeHeaderSelector = `${cellTypeTableSelector} .govuk-table__header`
            cy.get(cellTypeHeaderSelector).eq(0).contains('Location')
            cy.get(cellTypeHeaderSelector).eq(1).contains('Baseline CNA')
            cy.get(cellTypeHeaderSelector).eq(2).contains('Certified working capacity')
            cy.get(cellTypeHeaderSelector).eq(3).contains('Cell type')

            const cellTypeDataSelector = `${cellTypeTableSelector} .govuk-table__cell`
            cy.get(cellTypeDataSelector).eq(0).contains('A-1-001')
            cy.get(cellTypeDataSelector).eq(1).contains('2 → 0')
            cy.get(cellTypeDataSelector).eq(2).contains('2 → 0')
            cy.get(cellTypeDataSelector).eq(3).contains('None → Biohazard / dirty protest cell')

            cy.get('[data-qa="approval-request-SIGNED_OP_CAP"] h2').contains(
              'Change 2 - Change signed operational capacity',
            )
            const opCapRowsSelector = '[data-qa="overview-list-SIGNED_OP_CAP"] .govuk-summary-list__value'
            cy.get(opCapRowsSelector).eq(0).contains('TST')
            cy.get(opCapRowsSelector).eq(1).contains('Change signed operational capacity')
            cy.get(opCapRowsSelector).eq(2).contains('Op cap update was needed')

            const opCapChangesTableSelector = '[data-qa="cap-change-table"]'
            const opCapChangesDataSelector = `${opCapChangesTableSelector} .govuk-table__cell`
            cy.get(opCapChangesDataSelector).eq(0).contains('TST')
            cy.get(opCapChangesDataSelector).eq(1).contains('10 → 9')
          })

          context('validation errors', () => {
            it('displays the correct error(s) for required', () => {
              page.submit({})

              Page.checkForError(
                'set-cell-type_submit-certification-approval-request_confirmation',
                'Confirm that the cells meet the certification standards',
              )
            })
          })

          it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
            page.submit({
              confirm: true,
            })

            Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

            Page.checkForSuccessBanner(
              'Change requests sent',
              'You have submitted 2 requests to update the cell certificate.',
            )
          })
        })
      })
    })
  })
})
