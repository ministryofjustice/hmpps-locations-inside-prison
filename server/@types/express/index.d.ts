import { StoredReportData } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/UserReports'
import { BookmarkStoreData } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/Bookmark'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { Services } from '../../services'
import {
  Location,
  LocationSummary,
  LocationResidentialSummary,
  PrisonerLocation,
  PrisonResidentialSummary,
} from '../../data/types/locationsApi'
import { FeComponentsMeta } from '../../data/feComponentsClient'
import { DecoratedLocation } from '../../decorators/decoratedLocation'
import { SummaryListRow } from '../govuk'
import { LocationTree } from '../../controllers/reactivate/parent/middleware/populateLocationTree'
import config from '../../config'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
    referrerUrl: string
    returnTo: string
    systemToken: string
  }
}

interface TypedLocals {
  accommodationType?: string
  actions?: { text: string; href: string }[]
  archivedLocations?: DecoratedLocation[]
  backLink?: string
  baseUrl?: string
  bookmarkingEnabled?: boolean
  bookmarks?: BookmarkStoreData[]
  breadcrumbs?: {
    title: string
    href: string
  }[]
  buttonText?: string
  canAccess?: (permission: string) => boolean
  cancelLink?: string
  cards?: {
    clickable: boolean
    heading: string
    href: string
    description: string
    'data-qa': string
    visible: boolean
  }[]
  cell?: Location
  cellCount?: number
  cells?: Locations[]
  changeSummary?: string
  continueLink?: string
  cspNonce?: string
  csrfToken?: string
  currentSignedOperationalCapacity?: number
  deactivationReason?: string
  decoratedCell?: DecoratedLocation
  decoratedCells?: DecoratedLocation[]
  decoratedLocation?: DecoratedLocation
  decoratedLocationTree?: DecoratedLocationTree[]
  decoratedResidentialSummary?: {
    location?: DecoratedLocation
    locationDetails?: SummaryListRow[]
    locationHistory?: boolean // TODO: change this type when location history tab is implemented
    subLocationName: string
    subLocations: DecoratedLocation[]
    summaryCards: { type: string; text: string; linkHref?: string; linkLabel?: string; linkAriaLabel?: string }[]
  }
  definitions?: string[]
  definitionsPath?: string
  dpdPathFromConfig?: string
  dpdPathFromQuery?: string
  downloadingEnabled?: boolean
  errorlist?: FormWizard.Controller.Error[]
  errorMessage?: string
  errorStack?: string
  feComponents?: {
    header?: string
    footer?: string
    cssIncludes?: string[]
    jsIncludes?: string[]
    meta?: FeComponentsMeta
  }
  fields?: FormWizard.Fields
  inactiveCells?: DecoratedLocation[]
  inactiveParentLocations?: DecoratedLocation[]
  insetText?: string
  lastUpdate: { time: string; date: string; updatedBy: string }
  leafLevel?: boolean
  level2?: string
  level3?: string
  level4?: string
  location?: Location
  locationId?: string
  locationHierarchy?: LocationSummary[]
  locationResidentialSummary?: LocationResidentialSummary
  locationTree?: LocationTree[]
  maxCapacity?: string
  options?: {
    action: string
    allFields?: FormWizard.Fields
    enctype?: string
    fields?: FormWizard.Fields
    method: string
  }
  pageTitleText?: string
  pathSuffix?: string
  prisonId?: string
  prisonerLocation?: PrisonerLocation
  prisonResidentialSummary?: PrisonResidentialSummary
  recentlyViewedReports?: StoredReportData[]
  referrerRootUrl?: string
  requestedReports?: StoredReportData[]
  routePrefix?: string
  specialistCellTypes?: string[]
  summaryListRows?: SummaryListRow[]
  title?: string
  titleCaption?: string
  topLevelLocationType?: string
  usedForTypes?: string[]
  user?: HmppsUser
  validationErrors?: { text: string; href: string }[]
  values?: FormWizard.Values
  valuesHaveChanged?: boolean
  workingCapacity?: string
}

export declare module 'express' {
  interface Response {
    locals: TypedLocals
  }
}

export declare global {
  namespace Express {
    interface User {
      activeCaseload?: {
        id: string
        name: string
      }
      authSource: string
      caseloads?: {
        id: string
        name: string
      }[]
      displayName?: string
      name?: string
      staffId?: number
      token: string
      userId?: string
      username: string
      userRoles?: string[]
    }

    interface Flash {
      title: string
      content: string
    }

    interface Response {
      locals: TypedLocals
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      services?: Services
      flash(message: string): Flash[]
      flash(type: string, message: Flash): Flash[]
      canAccess: (permission: string) => boolean
      featureFlags?: (typeof config)['featureFlags']
    }
  }
}
