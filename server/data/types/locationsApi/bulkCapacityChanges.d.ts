export type BulkCapacityUpdate = {
  [p: string]: {
    maxCapacity: number
    workingCapacity: number
    certifiedNormalAccommodation: number
    cellMark: string
    inCellSanitation?: boolean
  }
}

export type CapacitySummary = {
  [key: string]: {
    maxCapacity: number
    workingCapacity: number
    certifiedNormalAccommodation: number
  }
}

export type BulkCapacityUpdateChanges = {
  [id: string]: Change[]
}

type Change = {
  key: string
  message: string
  type: string
  previousValue: number
  newValue: number
}
