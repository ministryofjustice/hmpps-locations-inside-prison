import { StoredReportData } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/UserReports'
import { BookmarkStoreData } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/Bookmark'
import { DprUser } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/DprUser'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { Services } from '../../services'
import {
  CellCertificate,
  Location,
  LocationSummary,
  LocationResidentialSummary,
  PrisonerLocation,
  PrisonResidentialSummary,
  PrisonConfiguration,
  LocationsApiConstant,
} from '../../data/types/locationsApi'
import { FeComponentsMeta } from '../../data/feComponentsClient'
import { DecoratedLocation } from '../../decorators/decoratedLocation'
import { SummaryListRow } from '../govuk'
import { LocationTree } from '../../controllers/reactivate/parent/middleware/populateLocationTree'
import config from '../../config'
import { BulkCapacityUpdate, CapacitySummary } from '../../data/types/locationsApi/bulkCapacityChanges'
import { CertificationApprovalRequest } from '../../data/types/locationsApi/certificationApprovalRequest'
import { NotificationDetails } from '../../data/types/locationsApi/notificationDetails'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
    referrerUrl: string
    returnTo: string
    systemToken: string
  }
}

interface card {
  clickable: boolean
  heading: string
  href: string
  description: string
  'data-qa': string
  visible: boolean
}

interface AllLocals {
  accommodationType: string
  actions: { text: string; href: string; class: string }[]
  approvalRequest: CertificationApprovalRequest
  approvalRequests: CertificationApprovalRequest[]
  archivedLocations: DecoratedLocation[]
  backLink: string
  backLinkText: string
  banner: {
    success?: {
      title: string
      content: string
    }
  }
  baseUrl: string
  bodyText: string
  bookmarkingEnabled: boolean
  bookmarks: BookmarkStoreData[]
  breadcrumbs: {
    title: string
    href: string
  }[]
  buttonText: string
  canAccess: (permission: string) => boolean
  cancelClasses: string
  cancelLink: string
  cancelText: string
  changeLinks: { [field: string]: string }
  resiCards: card[]
  nonResiCards: card[]
  cell: Location
  cellCount: number
  cells: Location[]
  notificationDetails: NotificationDetails
  changeSummary: string
  continueLink: string
  convertedCellTypeDetails: string
  constants: {
    accommodationTypes?: LocationsApiConstant[]
    convertedCellTypes?: LocationsApiConstant[]
    deactivatedReasons?: LocationsApiConstant[]
    locationTypes?: LocationsApiConstant[]
    nonResidentialUsageTypes?: LocationsApiConstant[]
    residentialAttributeTypes?: LocationsApiConstant[]
    residentialHousingTypes?: LocationsApiConstant[]
    specialistCellTypes?: (LocationsApiConstant & {
      additionalInformation?: string
      attributes?: { affectsCapacity: boolean }
    })[]
    usedForTypes?: LocationsApiConstant[]
  }
  createButton: {
    text: string
    href: string
    classes: string
    attributes: { [attr: string]: string }
  }
  createStructureLink: string
  createDetailsLink: string
  createRootLink: string
  createYouCanAddText: string
  cspNonce: string
  csrfToken: string
  currentSignedOperationalCapacity: number
  deactivationReason: string
  decoratedCell: DecoratedLocation
  decoratedCells: DecoratedLocation[]
  decoratedLocation: DecoratedLocation
  decoratedLocationTree: DecoratedLocationTree[]
  decoratedLocationStructure: string
  decoratedResidentialSummary: {
    location?: DecoratedLocation
    locationDetails?: SummaryListRow[]
    locationHistory?: boolean // TODO: change this type when location history tab is implemented
    subLocationName: string
    subLocations: DecoratedLocation[]
    summaryCards: { type: string; text: string; linkHref?: string; linkLabel?: string; linkAriaLabel?: string }[]
    wingStructure?: string[]
  }
  definitions: string[]
  definitionsPath: string
  dpdPathFromConfig: string
  dpdPathFromQuery: string
  dprUser: DprUser
  downloadingEnabled: boolean
  errorlist: FormWizard.Controller.Error[]
  errorMessage: string
  errorStack: string
  feComponents: {
    header?: string
    footer?: string
    cssIncludes?: string[]
    jsIncludes?: string[]
    meta?: FeComponentsMeta
  }
  fields: FormWizard.Fields
  inactiveCells: DecoratedLocation[]
  inactiveParentLocations: DecoratedLocation[]
  insetText: string
  lastUpdate: { time: string; date: string; updatedBy: string }
  leafLevel: boolean
  level2: string
  level3: string
  level4: string
  location: Location
  locationId: string
  locationHierarchy: LocationSummary[]
  locationMap: { [locationId: string]: Location }
  locationPathPrefix: string
  locationResidentialSummary: LocationResidentialSummary
  locationTree: LocationTree[]
  locationType: string
  maxCapacity: string
  minLayout: string
  options: FormWizard.Request['form']['options']
  pathSuffix: string
  prisonConfiguration: PrisonConfiguration
  prisonNonHousingDisabled: boolean
  nestedBaseUrl: string
  nomisScreenBlocked: boolean
  prisonId: string
  prisonerLocation: PrisonerLocation
  prisonResidentialSummary: PrisonResidentialSummary
  proposedCertificationApprovalRequests: Partial<CertificationApprovalRequest>[]
  recentlyViewedReports: StoredReportData[]
  referrerRootUrl: string
  requestedReports: StoredReportData[]
  routePrefix: string
  saveDefaultsEnabled: boolean
  signedOpCapChangeRequest: CertificationApprovalRequest
  specialistCellTypes: string[]
  certificate: CellCertificate
  certificates: CellCertificate[]
  removeHeadingSpacing: boolean
  summaryListRows: SummaryListRow[]
  title: string
  titleCaption: string
  topLevelDraftLocationSummary: LocationResidentialSummary
  topLevelLocationType: string
  usedForTypes: string[]
  user: HmppsUser
  userMap: { [username: string]: string }
  validationErrors: { text: string; href: string }[]
  values: FormWizard.Values
  valuesHaveChanged: boolean
  workingCapacity: string
  capacityData: BulkCapacityUpdate
  capacitySummary: CapacitySummary
}

type TypedLocals = Partial<AllLocals>

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
