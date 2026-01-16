import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import setupStubs from './setupStubs'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import DeactivateTemporaryDetailsPage from '../../../pages/deactivate/temporary/details'
import goToDetails from './goToDetails'

context('Certification Deactivation - Cell - Details', () => {
  const location = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: {
      maxCapacity: 2,
      workingCapacity: 1,
    },
    leafLevel: true,
    localName: null,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  })
  let page: DeactivateTemporaryDetailsPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP', location)

    page = goToDetails(location)
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    // eslint-disable-next-line no-new
    new CertChangeDisclaimerPage('Decreasing certified working capacity')
  })

  context('validation errors', () => {
    it('displays the correct error(s) for required', () => {
      page.submit({})

      Page.checkForError('deactivationReason', 'Select a deactivation reason')
      Page.checkForError('mandatoryEstimatedReactivationDate', 'Enter an estimated reactivation date')
      Page.checkForError(
        'workingCapacityExplanation',
        'Enter a reason the certified working capacity needs to be decreased',
      )
    })

    context('mandatoryEstimatedReactivationDate', () => {
      it('displays the correct errors', () => {
        page.submit({ day: '12' })
        Page.checkForError(
          'mandatoryEstimatedReactivationDate',
          'Estimated reactivation date must include a month and year',
        )

        page.submit({ month: '12' })
        Page.checkForError(
          'mandatoryEstimatedReactivationDate',
          'Estimated reactivation date must include a day and year',
        )

        page.submit({ year: '2025' })
        Page.checkForError(
          'mandatoryEstimatedReactivationDate',
          'Estimated reactivation date must include a day and month',
        )

        page.submit({ day: '12', month: '12' })
        Page.checkForError('mandatoryEstimatedReactivationDate', 'Estimated reactivation date must include a year')

        page.submit({ month: '12', year: '2025' })
        Page.checkForError('mandatoryEstimatedReactivationDate', 'Estimated reactivation date must include a day')

        page.submit({ day: '12', year: '2025' })
        Page.checkForError('mandatoryEstimatedReactivationDate', 'Estimated reactivation date must include a month')

        page.submit({ day: '12', month: '12', year: '2025' })
        Page.checkForError(
          'mandatoryEstimatedReactivationDate',
          'Estimated reactivation date must be today or in the future',
        )
      })
    })

    context('facilitiesManagementReference', () => {
      it('displays the correct errors', () => {
        page.submit({ reference: '1'.repeat(5) }) // minLength
        Page.checkForError(
          'facilitiesManagementReference',
          'Facilities management reference number must be at least 6 characters',
        )

        page.submit({ reference: '1'.repeat(19) }) // maxLength
        Page.checkForError(
          'facilitiesManagementReference',
          'Facilities management reference number must be 18 characters or less',
        )

        page.submit({ reference: 'abcdef' }) // numericString
        Page.checkForError(
          'facilitiesManagementReference',
          'Facilities management reference number must only include numbers',
        )
      })
    })
  })

  // TODO: next step
})
