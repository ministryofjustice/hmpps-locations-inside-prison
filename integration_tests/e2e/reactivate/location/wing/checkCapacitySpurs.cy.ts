import Page from '../../../../pages/page'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import EditCapacityPage from '../../../../pages/reactivate/location/editCapacity'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import LocationFactory from '../../../../../server/testutils/factories/location'
import setupStubsBase from '../setupStubs'
import goToCheckCapacity from '../goToCheckCapacity'
import { location, landing1, cell1 } from './setupStubs'

type CellTableRow = Parameters<CheckCapacityPage['testCellsTable']>[0][number]

const id = (number: number) => `7e570000-0000-000a-0001-000000000${number.toString().padStart(3, '0')}`

const spurs = ['East', 'West'].map((name, spurIndex) => {
  const spurPath = `A-${name}`
  const spur = LocationFactory.build({
    ...landing1,
    id: id(200 + spurIndex),
    parentId: location.id,
    pathHierarchy: spurPath,
    key: `TST-${spurPath}`,
    localName: name,
    locationType: 'SPUR',
  })
  const landings = ['Lower', 'Upper'].map((landingName, landingIndex) => {
    const index = spurIndex * 2 + landingIndex
    const landingPath = `${spurPath}-${landingName}`
    const landing = LocationFactory.build({
      ...landing1,
      id: id(210 + index),
      parentId: spur.id,
      pathHierarchy: landingPath,
      key: `TST-${landingPath}`,
      localName: landingName,
    })
    const cell = LocationFactory.build({
      ...cell1,
      id: id(220 + index),
      parentId: landing.id,
      pathHierarchy: `${landingPath}-001`,
      key: `TST-${landingPath}-001`,
    })
    return { landing, cell }
  })
  return { spur, landings }
})

context('Certification Reactivation - Wing with spurs - Check capacity', () => {
  it('groups cells correctly, retains edits and continues the journey', () => {
    setupStubsBase('MANAGE_RES_LOCATIONS_OP_CAP', location)
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
      parentLocation: location,
      subLocations: spurs.map(({ spur }) => spur),
      subLocationName: 'Spurs',
    })
    spurs.forEach(({ spur, landings }) => {
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: spur,
        subLocations: landings.map(({ landing }) => landing),
        subLocationName: 'Landings',
      })
      LocationsApiStubber.stub.stubLocations(spur)
      landings.forEach(({ landing, cell }) => {
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
          parentLocation: landing,
          subLocations: [cell],
          subLocationName: 'Cells',
        })
        LocationsApiStubber.stub.stubLocations(landing)
        LocationsApiStubber.stub.stubLocations(cell)
      })
    })
    LocationsApiStubber.stub.stubLocationsCellCertificatesPrisonCurrentFor([
      location,
      ...spurs.flatMap(({ spur, landings }) => [spur, ...landings.flatMap(({ landing, cell }) => [landing, cell])]),
    ])

    const page = goToCheckCapacity(location)
    const headingsAndLinks = [
      'East',
      'Lower',
      spurs[0].landings[0].landing.id,
      'Upper',
      spurs[0].landings[1].landing.id,
      'West',
      'Lower',
      spurs[1].landings[0].landing.id,
      'Upper',
      spurs[1].landings[1].landing.id,
    ]
    const headingAndLinkSelector =
      '#form-wizard-form h2, #form-wizard-form h3, #form-wizard-form a[href*="/edit-capacity/"]'
    cy.get(headingAndLinkSelector).should('have.length', headingsAndLinks.length)
    cy.get(headingAndLinkSelector).each(($element, index) => {
      const expected = headingsAndLinks[index]
      if ($element.is('a')) {
        expect($element.attr('href')).to.match(new RegExp(`/edit-capacity/${expected}$`))
      } else {
        expect($element.text().trim()).to.equal(expected)
      }
    })

    page.testCellsTable(
      spurs.flatMap(({ landings }) =>
        landings.map<CellTableRow>(({ cell }) => [
          cell.pathHierarchy,
          '1',
          '1',
          '2',
          ['Accessible cell', 'Constant Supervision Cell'],
        ]),
      ),
    )

    page.editCapacityLink(spurs[1].landings[1].landing.id).click()
    Page.verifyOnPage(EditCapacityPage).submit({ capacities: [['2', '2', '2']] })
    Page.verifyOnPage(CheckCapacityPage)
    page.testCellsTable(
      spurs.flatMap(({ landings }, spurIndex) =>
        landings.map<CellTableRow>(({ cell }, landingIndex) => [
          cell.pathHierarchy,
          spurIndex === 1 && landingIndex === 1 ? '2' : '1',
          spurIndex === 1 && landingIndex === 1 ? '2' : '1',
          '2',
          ['Accessible cell', 'Constant Supervision Cell'],
        ]),
      ),
    )
    page.submit()
    Page.verifyOnPage(CertChangeDisclaimerPage, 'Wing activation')
  })
})
