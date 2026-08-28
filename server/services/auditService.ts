import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  INDEX = 'INDEX',
  LOCATIONS_INDEX = 'LOCATIONS_INDEX',
  LOCATIONS_SHOW = 'LOCATIONS_SHOW',
  INACTIVE_CELLS = 'INACTIVE_CELLS',
  ARCHIVED_LOCATIONS = 'ARCHIVED_LOCATIONS',
  LOCATION_HISTORY = 'LOCATION_HISTORY',
  LOCATION_CREATE = 'LOCATION_CREATE',
  LOCATION_ADMIN = 'LOCATION_ADMIN',
  CAPACITY_MANAGEMENT_DASHBOARD = 'CAPACITY_MANAGEMENT_DASHBOARD',
  // Still "UPLOAD" while the rest of the UI says "import": these values are sent to the HMPPS Audit
  // service, and renaming them would split this journey's page views across two names (MAPA-326).
  CELL_CERTIFICATE_UPLOADS = 'CELL_CERTIFICATE_UPLOADS',
  CELL_CERTIFICATE_UPLOAD_DETAIL = 'CELL_CERTIFICATE_UPLOAD_DETAIL',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
