import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import CellConversionAccommodationTypePage from '../../pages/cellConversion/accommodationType'
import CellConversionConfirmPage from '../../pages/cellConversion/confirm'
import CellConversionSetCellCapacityPage from '../../pages/cellConversion/setCellCapacity'
import CellConversionSetCellTypePage from '../../pages/cellConversion/setCellType'
import CellConversionSpecificCellTypePage from '../../pages/cellConversion/specificCellType'
import CellConversionUsedForPage from '../../pages/cellConversion/usedFor'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Cell conversion', () => {
  const location = LocationFactory.build({
    isResidential: false,
    leafLevel: true,
    localName: '1-1-001',
  })

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsConstantsUsedForTypeForPrison')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.signIn()
    })

    it('redirects user to sign in page when accessed directly', () => {
      CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('does not show the convert to cell button on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.convertToCellButton().should('not.exist')
    })
  })

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RESIDENTIAL_LOCATIONS'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsConstantsUsedForTypeForPrison')
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubLocationsConvertToCell')
      cy.signIn()
    })

    it('can be accessed via the actions dropdown on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.convertToCellButton().click()

      Page.verifyOnPage(CellConversionAccommodationTypePage)
    })

    describe('accommodation type page', () => {
      beforeEach(() => {
        CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(CellConversionAccommodationTypePage)
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('has a back link', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a cancel link', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct radio buttons', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)

        accommodationTypePage.accommodationTypeRadioLabels().eq(0).contains('Care and separation')
        accommodationTypePage.accommodationTypeRadioLabels().eq(1).contains('Healthcare inpatients')
        accommodationTypePage.accommodationTypeRadioLabels().eq(2).contains('Normal accommodation')
      })

      it('shows the correct validation error when nothing is selected', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)

        accommodationTypePage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select an accommodation type')
        cy.get('#accommodationType-error').contains('Select an accommodation type')
      })

      it('goes straight to the specific cell type page when not NORMAL_ACCOMMODATION', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
        accommodationTypePage.continueButton().click()

        Page.verifyOnPage(CellConversionSpecificCellTypePage)
      })

      it('goes to the used for page when NORMAL_ACCOMMODATION is selected', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()

        Page.verifyOnPage(CellConversionUsedForPage)
      })
    })

    describe('used for page', () => {
      beforeEach(() => {
        CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(CellConversionUsedForPage)
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('has a back link', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()

        Page.verifyOnPage(CellConversionAccommodationTypePage)
      })

      it('has a cancel link', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has the expected hint text', () => {
        Page.verifyOnPage(CellConversionUsedForPage)

        cy.get('#usedForTypes-hint').contains('Select all that apply.')
      })

      it('shows the correct checkbox list', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)

        usedForPage.usedForCheckboxLabels().eq(0).contains('Close Supervision Centre (CSC)')
        usedForPage.usedForCheckboxLabels().eq(1).contains('Drug recovery / Incentivised substance free living (ISFL)')
        usedForPage.usedForCheckboxLabels().eq(2).contains('First night centre / Induction')
      })

      it('shows the correct validation error when nothing is selected', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)

        usedForPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select what the location is used for')
        cy.get('#usedForTypes-error').contains('Select what the location is used for')
      })

      it('continues to the specific cell type page', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)

        usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
        usedForPage.continueButton().click()

        Page.verifyOnPage(CellConversionSpecificCellTypePage)
      })
    })

    describe('specific cell type page', () => {
      context('when coming from the used for page', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
          accommodationTypePage.continueButton().click()
          const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
          usedForPage.continueButton().click()
        })

        it('has a back link to the used for page', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.backLink().click()

          Page.verifyOnPage(CellConversionUsedForPage)
        })
      })

      context('when coming straight from the accommodation types page', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
          accommodationTypePage.continueButton().click()
        })

        it('has a caption showing the cell description', () => {
          Page.verifyOnPage(CellConversionSpecificCellTypePage)
          cy.get('.govuk-caption-m').contains('1-1-001')
        })

        it('has a back link to the accommodation type page', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.backLink().click()

          Page.verifyOnPage(CellConversionAccommodationTypePage)
        })

        it('has a cancel link', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('shows the correct validation error when nothing is selected', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)

          specificCellTypePage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Select yes if it is a specific type of cell')
          cy.get('#hasSpecificCellType-error').contains('Select yes if it is a specific type of cell')
        })

        it('goes straight to the set cell capacity page when answering no', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.noRadioButton().click()
          specificCellTypePage.continueButton().click()

          Page.verifyOnPage(CellConversionSetCellCapacityPage)
        })

        it('continues to the set cell type page when answering yes', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.yesRadioButton().click()
          specificCellTypePage.continueButton().click()

          Page.verifyOnPage(CellConversionSetCellTypePage)
        })
      })
    })

    describe('set cell type page', () => {
      beforeEach(() => {
        CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
        accommodationTypePage.continueButton().click()
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(CellConversionSetCellTypePage)
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('has a back link', () => {
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.backLink().click()

        Page.verifyOnPage(CellConversionSpecificCellTypePage)
      })

      it('has a cancel link', () => {
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has the expected hint text', () => {
        Page.verifyOnPage(CellConversionSetCellTypePage)

        cy.get('#specialistCellTypes-hint').contains('Select all that apply.')
      })

      it('shows the correct checkbox list', () => {
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)

        setCellTypePage.cellTypeCheckboxLabels().eq(0).contains('Accessible cell')
        setCellTypePage
          .cellTypeCheckboxHints()
          .eq(0)
          .contains('Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant')
        setCellTypePage.cellTypeCheckboxLabels().eq(1).contains('Biohazard / dirty protest cell')
        setCellTypePage.cellTypeCheckboxHints().eq(1).contains('Previously known as a dirty protest cell')
        setCellTypePage.cellTypeCheckboxLabels().eq(2).contains('Constant Supervision Cell')
      })

      it('has an inset text warning about working capacity', () => {
        Page.verifyOnPage(CellConversionSetCellTypePage)

        cy.get('.govuk-inset-text p').contains(
          'Set the working capacity to 0 for special accommodation cells as they should only be used for temporary housing:',
        )
        cy.get('.govuk-inset-text li').eq(0).contains('Biohazard cells')
        cy.get('.govuk-inset-text li').eq(1).contains('Care and separation cells')
        cy.get('.govuk-inset-text li').eq(2).contains('Dry cells')
        cy.get('.govuk-inset-text li').eq(3).contains('Unfurnished cells')
      })

      it('shows the correct validation error when nothing is selected', () => {
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)

        setCellTypePage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select a cell type')
        cy.get('#specialistCellTypes-error').contains('Select a cell type')
      })

      it('continues to the set cell capacity page', () => {
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').click()
        setCellTypePage.continueButton().click()

        Page.verifyOnPage(CellConversionSetCellCapacityPage)
      })
    })

    describe('set cell capacity page', () => {
      context('when coming from the set cell type page', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
          accommodationTypePage.continueButton().click()
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.yesRadioButton().click()
          specificCellTypePage.continueButton().click()
          const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
          setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').click()
          setCellTypePage.continueButton().click()
        })

        it('has a back link to the set cell type page', () => {
          const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          setCellCapacityPage.backLink().click()

          Page.verifyOnPage(CellConversionSetCellTypePage)
        })
      })

      context('when coming straight from the specific cell type page', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
          accommodationTypePage.continueButton().click()
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.noRadioButton().click()
          specificCellTypePage.continueButton().click()
        })

        it('has a back link to the specific cell type page', () => {
          const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          setCellCapacityPage.backLink().click()

          Page.verifyOnPage(CellConversionSpecificCellTypePage)
        })

        it('has a cancel link', () => {
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          changeCellCapacityPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a caption showing the cell description', () => {
          Page.verifyOnPage(CellConversionSetCellCapacityPage)

          cy.get('.govuk-caption-m').contains('1-1-001')
        })

        describe('validations', () => {
          it('shows the correct validation error when missing working capacity', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('4')
            changeCellCapacityPage.workingCapacityInput().clear()
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
            cy.get('#workingCapacity-error').contains('Enter a working capacity')
          })

          it('shows the correct validation error when working capacity > 99', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('4')
            changeCellCapacityPage.workingCapacityInput().clear().type('100')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
            cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
          })

          it('shows the correct validation error when working capacity is not a number', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('4')
            changeCellCapacityPage.workingCapacityInput().clear().type('hello')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
            cy.get('#workingCapacity-error').contains('Working capacity must be a number')
          })

          it('shows the correct validation error when working capacity is greater than max capacity', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('3')
            changeCellCapacityPage.workingCapacityInput().clear().type('4')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
            cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
          })

          it('shows the correct validation error when missing max capacity', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear()
            changeCellCapacityPage.workingCapacityInput().clear().type('2')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Enter a maximum capacity')
            cy.get('#maxCapacity-error').contains('Enter a maximum capacity')
          })

          it('shows the correct validation error when max capacity > 99', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('100')
            changeCellCapacityPage.workingCapacityInput().clear().type('2')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be more than 99')
            cy.get('#maxCapacity-error').contains('Maximum capacity cannot be more than 99')
          })

          it('shows the correct validation error when max capacity is not a number', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('hello')
            changeCellCapacityPage.workingCapacityInput().clear().type('2')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity must be a number')
            cy.get('#maxCapacity-error').contains('Maximum capacity must be a number')
          })

          it('shows the correct validation error when max capacity is zero', () => {
            const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

            changeCellCapacityPage.maxCapacityInput().clear().type('0')
            changeCellCapacityPage.workingCapacityInput().clear().type('0')
            changeCellCapacityPage.continueButton().click()

            cy.get('.govuk-error-summary__title').contains('There is a problem')
            cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
            cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
          })
        })

        it('continues to the confirmation page', () => {
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()

          Page.verifyOnPage(CellConversionConfirmPage)
        })
      })

      context('when NORMAL_ACCOMMODATION but no specialist cell type', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
          accommodationTypePage.continueButton().click()
          const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
          usedForPage.continueButton().click()
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.noRadioButton().click()
          specificCellTypePage.continueButton().click()
        })

        it('shows the correct validation error when working capacity is zero', () => {
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)

          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('0')
          changeCellCapacityPage.continueButton().click()

          cy.get('.govuk-error-summary__title').contains('There is a problem')
          cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
          cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
        })
      })
    })

    describe('confirmation page', () => {
      context('when NORMAL_ACCOMMODATION and specific cell types', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
          accommodationTypePage.continueButton().click()
          const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
          usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
          usedForPage.continueButton().click()
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.yesRadioButton().click()
          specificCellTypePage.continueButton().click()
          const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
          setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').click()
          setCellTypePage.cellTypeCheckboxItem('BIOHAZARD_DIRTY_PROTEST').click()
          setCellTypePage.continueButton().click()
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()
        })

        it('has a cancel link', () => {
          const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
          confirmPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a back link to the set cell capacity page', () => {
          const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
          confirmPage.backLink().click()

          Page.verifyOnPage(CellConversionSetCellCapacityPage)
        })

        it('shows the correct summary list', () => {
          Page.verifyOnPage(CellConversionConfirmPage)

          cy.get('h2.govuk-summary-card__title').contains('Conversion details')
          cy.get('.govuk-summary-list__key').eq(0).contains('Accommodation type')
          cy.get('.govuk-summary-list__value').eq(0).contains('Normal accommodation')
          cy.get('.govuk-summary-list__key').eq(1).contains('Used for')
          cy.get('.govuk-summary-list__value')
            .eq(1)
            .invoke('text')
            .should(
              'match',
              /Close Supervision Centre \(CSC\)\s*Drug recovery \/ Incentivised substance free living \(ISFL\)/,
            )
          cy.get('.govuk-summary-list__key').eq(2).contains('Cell type')
          cy.get('.govuk-summary-list__value')
            .eq(2)
            .invoke('text')
            .should('match', /Accessible cell\s*Biohazard \/ dirty protest cell/)
          cy.get('.govuk-summary-list__key').eq(3).contains('Working capacity')
          cy.get('.govuk-summary-list__value').eq(3).contains('2')
          cy.get('.govuk-summary-list__key').eq(4).contains('Maximum capacity')
          cy.get('.govuk-summary-list__value').eq(4).contains('3')
        })

        it('shows the correct change summary', () => {
          Page.verifyOnPage(CellConversionConfirmPage)

          cy.get('.change-summary h2').contains('Change to establishment capacity')
          cy.get('.change-summary p').contains(/^This will increase the establishment’s working capacity from 8 to 10./)
          cy.get('.change-summary p').contains(/This will increase the establishment’s maximum capacity from 9 to 12.$/)
        })

        it('has the correct warning text', () => {
          cy.get('.govuk-warning-text__text').contains('This cell will be certified and active.')
        })

        it('shows the success banner on completion', () => {
          const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
          confirmPage.confirmConversionButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Non-residential room converted to a cell')
          cy.get('.govuk-notification-banner__content p').contains('You have converted 1-1-001 into a cell.')
        })
      })

      context('when not NORMAL_ACCOMMODATION and with no specific cell types', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
          accommodationTypePage.continueButton().click()
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.noRadioButton().click()
          specificCellTypePage.continueButton().click()
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          changeCellCapacityPage.maxCapacityInput().clear().type('3')
          changeCellCapacityPage.workingCapacityInput().clear().type('2')
          changeCellCapacityPage.continueButton().click()
        })

        it('shows the correct summary list', () => {
          Page.verifyOnPage(CellConversionConfirmPage)

          cy.get('h2.govuk-summary-card__title').contains('Conversion details')
          cy.get('.govuk-summary-list__key').eq(0).contains('Accommodation type')
          cy.get('.govuk-summary-list__value').eq(0).contains('Care and separation')
          cy.get('.govuk-summary-list__key').eq(1).contains('Cell type')
          cy.get('.govuk-summary-list__value').eq(1).contains('None')
          cy.get('.govuk-summary-list__key').eq(2).contains('Working capacity')
          cy.get('.govuk-summary-list__value').eq(2).contains('2')
          cy.get('.govuk-summary-list__key').eq(3).contains('Maximum capacity')
          cy.get('.govuk-summary-list__value').eq(3).contains('3')
        })
      })

      context('when converting Non Residential change to residential cell', () => {
        beforeEach(() => {
          CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
          accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
          accommodationTypePage.continueButton().click()
          const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
          usedForPage.continueButton().click()
        })

        it('used for unchecked box continue next display error', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.noRadioButton().click()
          specificCellTypePage.continueButton().click()
          const changeCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          changeCellCapacityPage.backLink().click()
          specificCellTypePage.backLink().click()
          const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
          usedForPage.continueButton().click()
          Page.verifyOnPage(CellConversionUsedForPage)
          usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').should('not.be.checked')
        })

        it('specific cell types unchecked box continue next display error', () => {
          const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
          specificCellTypePage.yesRadioButton().click()
          specificCellTypePage.continueButton().click()
          const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
          setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').check()
          setCellTypePage.continueButton().click()
          const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
          Page.verifyOnPage(CellConversionSetCellCapacityPage)
          setCellCapacityPage.backLink().click()
          setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').uncheck()
          setCellTypePage.continueButton().click()
          setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').should('not.be.checked')
        })
      })
    })
  })
})
