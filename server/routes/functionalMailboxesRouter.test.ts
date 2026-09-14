import type { Express } from 'express'
import request from 'supertest'

import { NotificationGroup, PrisonNotificationMailboxDto } from '../data/types/locationsApi'
import AuditService from '../services/auditService'
import LocationsService from '../services/locationsService'
import ManageUsersService from '../services/manageUsersService'
import { appWithAllRoutes, flashProvider, user } from './testutils/appSetup'

jest.mock('../services/auditService')
jest.mock('../services/locationsService')
jest.mock('../services/manageUsersService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
const adminUser = { ...user, userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'] }

const mailbox = (
  notificationGroup: NotificationGroup,
  emailAddresses: string[],
  prisonId?: string,
): PrisonNotificationMailboxDto => ({
  notificationGroup,
  emailAddresses,
  source: prisonId ? 'PRISON' : 'DEFAULT',
  prisonId,
})

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { auditService, locationsService, manageUsersService },
    userSupplier: () => adminUser,
  })
  auditService.logPageView.mockResolvedValue(null)
  manageUsersService.getCaseloads.mockResolvedValue([
    { id: 'LEI', name: 'Leeds (HMP)' },
    { id: 'MDI', name: 'Moorland (HMP & YOI)' },
    { id: 'OUT', name: 'Outside' },
  ])
  locationsService.getNotificationMailbox.mockResolvedValue(undefined)
  locationsService.getPrisonNotificationMailboxes.mockResolvedValue([])
  flashProvider.mockReturnValue([])
})

afterEach(() => jest.resetAllMocks())

describe('functional mailbox routes', () => {
  it('shows separate tables for configured default and prison-specific mailboxes', async () => {
    locationsService.getNotificationMailbox.mockImplementation(async (_token, group) => {
      if (group === 'CERT_ADMIN') return mailbox(group, ['default@example.com'])
      return undefined
    })
    locationsService.getPrisonNotificationMailboxes.mockResolvedValue([
      mailbox('CERT_REVIEWER', ['leeds@example.com'], 'LEI'),
    ])

    const response = await request(app).get('/functional-mailboxes').expect(200)

    expect(response.text).toContain('data-qa="default-mailboxes-table"')
    expect(response.text).toContain('data-qa="prison-mailboxes-table"')
    expect(response.text).toContain('aria-label="Default functional mailboxes"')
    expect(response.text).toContain('aria-label="Prison-specific functional mailboxes"')
    expect(response.text).toContain('default@example.com')
    expect(response.text).toContain('Leeds (HMP)')
    expect(response.text).toContain('leeds@example.com')
    expect(response.text).toContain('/functional-mailboxes/default/CERT_ADMIN/edit')
    expect(response.text).toContain('/functional-mailboxes/prison/LEI/CERT_REVIEWER/delete')
    expect(locationsService.getNotificationMailbox).toHaveBeenCalledTimes(3)
    expect(locationsService.getPrisonNotificationMailboxes).toHaveBeenCalledWith(undefined)
  })

  it('shows empty states when no mailboxes are configured', async () => {
    const response = await request(app).get('/functional-mailboxes').expect(200)

    expect(response.text).toContain('There are no default functional mailboxes.')
    expect(response.text).toContain('There are no prison-specific functional mailboxes.')
  })

  it('shows prison and role dropdowns when adding a prison-specific mailbox', async () => {
    const response = await request(app).get('/functional-mailboxes/prison/add').expect(200)

    expect(response.text).toContain('Add prison-specific mailbox')
    expect(response.text).toContain('name="prisonId"')
    expect(response.text).toContain('Leeds (HMP)')
    expect(response.text).not.toContain('Outside')
    expect(response.text).toContain('name="notificationGroup"')
    expect(response.text).toContain('Certification reviewer')
  })

  it('normalises and saves a new prison-specific mailbox', async () => {
    await request(app)
      .post('/functional-mailboxes/prison/add')
      .type('form')
      .send({
        prisonId: 'LEI',
        notificationGroup: 'CERT_REVIEWER',
        emailAddresses: 'One@Example.com\ntwo@example.com\none@example.com',
      })
      .expect(302)
      .expect('Location', '/functional-mailboxes')

    expect(locationsService.replaceNotificationMailbox).toHaveBeenCalledWith(
      undefined,
      'CERT_REVIEWER',
      ['one@example.com', 'two@example.com'],
      'LEI',
    )
  })

  it.each(['.a@example.com', 'a..b@example.com', 'a@example..com'])(
    'rejects malformed email address %s before saving',
    async emailAddress => {
      const response = await request(app)
        .post('/functional-mailboxes/default/add')
        .type('form')
        .send({ notificationGroup: 'CERT_ADMIN', emailAddresses: emailAddress })
        .expect(200)

      expect(response.text).toContain(`Enter a valid email address: ${emailAddress}`)
      expect(locationsService.replaceNotificationMailbox).not.toHaveBeenCalled()
    },
  )

  it('shows an inline error when the selected prison is not available in Locations', async () => {
    locationsService.replaceNotificationMailbox.mockRejectedValue({ responseStatus: 404 })

    const response = await request(app)
      .post('/functional-mailboxes/prison/add')
      .type('form')
      .send({
        prisonId: 'LEI',
        notificationGroup: 'CERT_REVIEWER',
        emailAddresses: 'reviewer@example.com',
      })
      .expect(200)

    expect(response.text).toContain('This prison is not available in Locations')
    expect(locationsService.replaceNotificationMailbox).toHaveBeenCalledWith(
      undefined,
      'CERT_REVIEWER',
      ['reviewer@example.com'],
      'LEI',
    )
  })

  it('does not overwrite an existing mailbox through the add journey', async () => {
    locationsService.getNotificationMailbox.mockResolvedValue(mailbox('CERT_ADMIN', ['existing@example.com']))

    const response = await request(app)
      .post('/functional-mailboxes/default/add')
      .type('form')
      .send({ notificationGroup: 'CERT_ADMIN', emailAddresses: 'new@example.com' })
      .expect(200)

    expect(response.text).toContain('A mailbox already exists for this role')
    expect(locationsService.replaceNotificationMailbox).not.toHaveBeenCalled()
  })

  it('shows and processes delete confirmation', async () => {
    locationsService.getNotificationMailbox.mockResolvedValue(mailbox('CERT_VIEWER', ['viewer@example.com']))

    const confirmation = await request(app).get('/functional-mailboxes/default/CERT_VIEWER/delete').expect(200)
    expect(confirmation.text).toContain('Delete default mailbox')
    expect(confirmation.text).toContain('viewer@example.com')
    expect(confirmation.text).toContain('Delete mailbox')
    expect(confirmation.text).toContain('Prison-specific mailboxes are unaffected.')
    expect(confirmation.text).toContain('will use the usual role-based recipients.')

    await request(app)
      .post('/functional-mailboxes/default/CERT_VIEWER/delete')
      .expect(302)
      .expect('Location', '/functional-mailboxes')
    expect(locationsService.deleteNotificationMailbox).toHaveBeenCalledWith(undefined, 'CERT_VIEWER', undefined)
  })

  it('denies access to users without the admin permission', () => {
    app = appWithAllRoutes({
      services: { auditService, locationsService, manageUsersService },
      userSupplier: () => user,
    })

    return request(app).get('/functional-mailboxes').expect(302).expect('Location', '/sign-out')
  })
})
