import LocationFactory from '../../../../../server/testutils/factories/location'
import setupStubsBase from '../setupStubs'

export const location = LocationFactory.build({
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    maxCapacity: 10,
    workingCapacity: 0,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  status: 'INACTIVE',
  locationType: 'LANDING',
})

export function setupStubs(role: string) {
  setupStubsBase(role, location)
}
