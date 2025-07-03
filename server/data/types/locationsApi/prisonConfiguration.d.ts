export declare interface PrisonConfiguration {
  prisonId: string
  resiLocationServiceActive: StatusType
  includeSegregationInRollCount: StatusType
  certificationApprovalRequired: StatusType
}

export declare type StatusType = 'ACTIVE' | 'INACTIVE'
