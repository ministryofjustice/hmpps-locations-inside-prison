import { LocationsApiConstant } from './constant'

export declare interface NotificationDetails {
  changeType?: string
  locationKey?: string
  locationName?: string
  prisonId?: string
  prisonName: string
  requestedBy?: string
  requestedDate?: string
  usedForConstants?: LocationsApiConstant[]
}
