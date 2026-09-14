import { NotificationGroup } from '../../data/types/locationsApi'

export const notificationGroups: { value: NotificationGroup; text: string }[] = [
  { value: 'CERT_ADMIN', text: 'Certification administrator' },
  { value: 'CERT_VIEWER', text: 'Certification viewer' },
  { value: 'CERT_REVIEWER', text: 'Certification reviewer' },
]

export const notificationGroupLabel = (value: NotificationGroup) =>
  notificationGroups.find(group => group.value === value)?.text || value

export const isNotificationGroup = (value: string): value is NotificationGroup =>
  notificationGroups.some(group => group.value === value)

export const isLocationsPrison = (prisonId: string) => /^[A-Z]{2}I$|^ZZGHI$/.test(prisonId)
