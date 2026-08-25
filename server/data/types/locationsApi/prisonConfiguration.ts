export declare interface PrisonConfiguration {
  prisonId: string
  resiLocationServiceActive: string
  nonResiServiceActive: string
  includeSegregationInRollCount: string
  certificationApprovalRequired: string
}

export declare type StatusType = 'ACTIVE' | 'INACTIVE'

export declare type NotificationGroup = 'CERT_ADMIN' | 'CERT_VIEWER' | 'CERT_REVIEWER'

export declare type NotificationMailboxSource = 'PRISON' | 'DEFAULT'

export declare interface PrisonNotificationMailboxDto {
  prisonId?: string
  notificationGroup: NotificationGroup
  emailAddresses: string[]
  source: NotificationMailboxSource
}
