import LocationFactory from '../../../server/testutils/factories/location'
import CellConversionAccommodationTypePage from '../../pages/cellConversion/accommodationType'
import CellConversionConfirmPage from '../../pages/cellConversion/confirm'
import CellConversionSetCellCapacityPage from '../../pages/cellConversion/setCellCapacity'
import CellConversionSetCellTypePage from '../../pages/cellConversion/setCellType'
import CellConversionSpecificCellTypePage from '../../pages/cellConversion/specificCellType'
import CellConversionUsedForPage from '../../pages/cellConversion/usedFor'
import Page from '../../pages/page'

context('Cell conversion', () => {
  const location = LocationFactory.build({
    isResidential: false,
    leafLevel: true,
    localName: '1-1-001',
  })

  beforeEach(() => {
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
    cy.task('stubLocationsConstantsUsedForTypeForPrison')
    cy.task('stubLocationsLocationsResidentialSummary')
    cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
    cy.task('stubLocations', location)
    cy.task('stubPrisonerLocationsId', [])
    cy.task('stubLocationsConvertToCell')
    cy.task('setFeatureFlag', { createAndCertify: false })
    // TODO: write tests for createAndCertify?
    cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
    cy.signIn()
  })

  describe('when NORMAL_ACCOMMODATION with specific cell types', () => {
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
      const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
      setCellCapacityPage.maxCapacityInput().clear().type('3')
      setCellCapacityPage.workingCapacityInput().clear().type('2')
      setCellCapacityPage.continueButton().click()
    })

    describe('when editing the accommodation type', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeAccommodationTypeLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can edit the answer to something different', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
        accommodationTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Care and separation')
      })

      it('can edit the answer to the same accommodation type but change the used for types', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
        usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
        usedForPage.usedForCheckboxItem('FIRST_NIGHT_CENTRE').click()
        usedForPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Normal accommodation')
        cy.get('.govuk-summary-list__value').eq(1).contains('First night centre / Induction')
      })

      it('can edit the answer to the same accommodation type but then click back twice to cancel', () => {
        let accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()
        accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Normal accommodation')
        cy.get('.govuk-summary-list__value')
          .eq(1)
          .invoke('text')
          .should(
            'match',
            /Close Supervision Centre \(CSC\)\s*Drug recovery \/ Incentivised substance free living \(ISFL\)/,
          )
      })
    })

    describe('when editing the used for types', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeUsedForTypesLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can edit the used for types', () => {
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
        usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
        usedForPage.usedForCheckboxItem('FIRST_NIGHT_CENTRE').click()
        usedForPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(1).contains('First night centre / Induction')
      })
    })

    describe('when editing the specific cell types', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeCellTypesLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can edit the answer to no', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.noRadioButton().click()
        specificCellTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('None')
      })

      it('can keep the answer as yes but change the specific cell types', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').click()
        setCellTypePage.cellTypeCheckboxItem('BIOHAZARD_DIRTY_PROTEST').click()
        setCellTypePage.cellTypeCheckboxItem('CONSTANT_SUPERVISION').click()
        setCellTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('Constant Supervision Cell')
      })

      it('can keep the answer as yes but then click back twice to cancel', () => {
        let specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.backLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value')
          .eq(2)
          .invoke('text')
          .should('match', /Accessible cell\s*Biohazard \/ dirty protest cell/)
      })
    })

    describe('when editing the max capacity', () => {
      it('has a back link to the confirmation page', () => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeMaxCapacityLink().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can edit the cell capacity', () => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeMaxCapacityLink().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.maxCapacityInput().clear().type('4')
        setCellCapacityPage.workingCapacityInput().clear().type('1')
        setCellCapacityPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(3).contains('1')
        cy.get('.govuk-summary-list__value').eq(4).contains('4')
      })
    })
  })

  describe('when NORMAL_ACCOMMODATION with specific cell types and zero working cap', () => {
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
      const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
      setCellCapacityPage.maxCapacityInput().clear().type('3')
      setCellCapacityPage.workingCapacityInput().clear().type('0')
      setCellCapacityPage.continueButton().click()
    })

    describe('when editing the specific cell types', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeCellTypesLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('prompts for cell capacity again when editing the answer to no', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.noRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.maxCapacityInput().clear().type('3')
        setCellCapacityPage.workingCapacityInput().clear().type('2')
        setCellCapacityPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('None')
        cy.get('.govuk-summary-list__value').eq(3).contains('2')
        cy.get('.govuk-summary-list__value').eq(4).contains('3')
      })

      it('restores the cell types when on cell capacity page but then clicking back twice', () => {
        let specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.noRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.backLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value')
          .eq(2)
          .invoke('text')
          .should('match', /Accessible cell\s*Biohazard \/ dirty protest cell/)
        cy.get('.govuk-summary-list__value').eq(3).contains('0')
        cy.get('.govuk-summary-list__value').eq(4).contains('3')
      })

      it('does not prompt for cell capacity again when choosing yes again', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.cellTypeCheckboxItem('ACCESSIBLE_CELL').click()
        setCellTypePage.cellTypeCheckboxItem('BIOHAZARD_DIRTY_PROTEST').click()
        setCellTypePage.cellTypeCheckboxItem('CONSTANT_SUPERVISION').click()
        setCellTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('Constant Supervision Cell')
      })

      it('can keep the answer as yes but then click back twice to cancel', () => {
        let specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.backLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value')
          .eq(2)
          .invoke('text')
          .should('match', /Accessible cell\s*Biohazard \/ dirty protest cell/)
      })

      it('clears saved cell type values when editing the answer to no', () => {
        let specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.noRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.maxCapacityInput().clear().type('3')
        setCellCapacityPage.workingCapacityInput().clear().type('2')
        setCellCapacityPage.continueButton().click()
        let confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('None')
        cy.get('.govuk-summary-list__value').eq(3).contains('2')
        cy.get('.govuk-summary-list__value').eq(4).contains('3')
        confirmPage.changeCellTypesLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        cy.get('input[name="specialistCellTypes"][type="checkbox"]:checked').should('not.exist')
        setCellTypePage.backLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('None')
        cy.get('.govuk-summary-list__value').eq(3).contains('2')
        cy.get('.govuk-summary-list__value').eq(4).contains('3')
      })
    })
  })

  describe('when not NORMAL_ACCOMMODATION but with no specific cell types and zero working cap', () => {
    beforeEach(() => {
      CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
      accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
      accommodationTypePage.continueButton().click()
      const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
      specificCellTypePage.noRadioButton().click()
      specificCellTypePage.continueButton().click()
      const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
      setCellCapacityPage.maxCapacityInput().clear().type('3')
      setCellCapacityPage.workingCapacityInput().clear().type('0')
      setCellCapacityPage.continueButton().click()
    })

    describe('when editing the accommodation type', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeAccommodationTypeLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('prompts for cell capacity again when changing to NORMAL_ACCOMMODATION', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
        usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
        usedForPage.continueButton().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.maxCapacityInput().clear().type('3')
        setCellCapacityPage.workingCapacityInput().clear().type('2')
        setCellCapacityPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(2).contains('None')
        cy.get('.govuk-summary-list__value').eq(3).contains('2')
        cy.get('.govuk-summary-list__value').eq(4).contains('3')
      })

      it('can go back from the used for page', () => {
        let accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()
        accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Care and separation')
        cy.get('.govuk-summary-list__value').eq(1).contains('None')
      })

      it('can go back from the cell capacity page', () => {
        let accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        let usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
        usedForPage.continueButton().click()
        const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
        setCellCapacityPage.backLink().click()
        usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()
        accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Care and separation')
        cy.get('.govuk-summary-list__value').eq(1).contains('None')
      })
    })
  })

  describe('when not NORMAL_ACCOMMODATION and with no specific cell types', () => {
    beforeEach(() => {
      CellConversionAccommodationTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
      accommodationTypePage.accommodationTypeRadioItem('CARE_AND_SEPARATION').click()
      accommodationTypePage.continueButton().click()
      const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
      specificCellTypePage.noRadioButton().click()
      specificCellTypePage.continueButton().click()
      const setCellCapacityPage = Page.verifyOnPage(CellConversionSetCellCapacityPage)
      setCellCapacityPage.maxCapacityInput().clear().type('3')
      setCellCapacityPage.workingCapacityInput().clear().type('2')
      setCellCapacityPage.continueButton().click()
    })

    describe('when editing the accommodation type', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeAccommodationTypeLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can edit the answer and add used for types', () => {
        const accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.usedForCheckboxItem('CLOSE_SUPERVISION_CENTRE').click()
        usedForPage.usedForCheckboxItem('SUB_MISUSE_DRUG_RECOVERY').click()
        usedForPage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Normal accommodation')
        cy.get('.govuk-summary-list__value')
          .eq(1)
          .invoke('text')
          .should(
            'match',
            /Close Supervision Centre \(CSC\)\s*Drug recovery \/ Incentivised substance free living \(ISFL\)/,
          )
      })

      it('can edit the accommodation type but then click back twice to cancel', () => {
        let accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.accommodationTypeRadioItem('NORMAL_ACCOMMODATION').click()
        accommodationTypePage.continueButton().click()
        const usedForPage = Page.verifyOnPage(CellConversionUsedForPage)
        usedForPage.backLink().click()
        accommodationTypePage = Page.verifyOnPage(CellConversionAccommodationTypePage)
        accommodationTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(0).contains('Care and separation')
        cy.get('.govuk-summary-list__key').eq(1).contains('Cell type') // No used for row
      })
    })

    describe('when editing the specific cell types', () => {
      beforeEach(() => {
        const confirmPage = Page.verifyOnPage(CellConversionConfirmPage)
        confirmPage.changeCellTypesLink().click()
      })

      it('has a back link to the confirmation page', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
      })

      it('can keep the answer as no', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.noRadioButton().click()
        specificCellTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(1).contains('None')
      })

      it('can edit the answer to yes', () => {
        const specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.cellTypeCheckboxItem('CONSTANT_SUPERVISION').click()
        setCellTypePage.continueButton().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(1).contains('Constant Supervision Cell')
      })

      it('can edit the answer to yes but then click back twice to cancel', () => {
        let specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.yesRadioButton().click()
        specificCellTypePage.continueButton().click()
        const setCellTypePage = Page.verifyOnPage(CellConversionSetCellTypePage)
        setCellTypePage.backLink().click()
        specificCellTypePage = Page.verifyOnPage(CellConversionSpecificCellTypePage)
        specificCellTypePage.backLink().click()
        Page.verifyOnPage(CellConversionConfirmPage)
        cy.get('.govuk-summary-list__value').eq(1).contains('None')
      })
    })
  })
})
