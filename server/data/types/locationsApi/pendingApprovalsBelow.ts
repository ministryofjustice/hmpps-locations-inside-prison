export declare interface PendingApprovalsBelow {
  hasPendingBelow: boolean
  pendingLocations: {
    id: string
    key: string
    locationType: string
    parentId: string
    parentKey: string
    parentLocationType: string
  }[]
}
