export declare interface Prisoner {
  prisonerNumber: string
  prisonId: string
  prisonName: string
  cellLocation: string
  firstName: string
  lastName: string
  gender: string
  csra: string
  category: string
  alerts: {
    alertType: string
    alertCode: string
    active: boolean
    expired: boolean
  }[]
}
