import { Factory } from 'fishery'

import { Prisoner } from '../../data/types/locationsApi'

const PrisonerFactory = Factory.define<Prisoner>(() => {
  return {
    prisonerNumber: 'A1234AA',
    prisonId: 'TST',
    prisonName: 'HMP Leeds',
    cellLocation: 'A-1-001',
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
  }
})

export default PrisonerFactory
