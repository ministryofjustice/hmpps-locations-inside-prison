import { Request, Response } from 'express'
import { NotFound } from 'http-errors'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import isEmail from 'validator/lib/isEmail'

import { NotificationGroup } from '../../data/types/locationsApi'
import paths from '../../utils/paths'
import { isLocationsPrison, isNotificationGroup, notificationGroupLabel, notificationGroups } from './constants'

type MailboxType = 'default' | 'prison'

const getParam = (value: string | string[]) => (Array.isArray(value) ? value[0] : value)

const parseEmails = (value: unknown) => [
  ...new Set(
    String(value || '')
      .split(/[\n,;]/)
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
  ),
]

const invalidEmails = (emails: string[]) => emails.filter(email => !isEmail(email))

const getPrisons = async (req: Request) =>
  (await req.services.manageUsersService.getCaseloads(req.session.systemToken))
    .filter(prison => isLocationsPrison(prison.id))
    .sort((a, b) => a.name.localeCompare(b.name))

const renderForm = async (
  req: Request,
  res: Response,
  type: MailboxType,
  mode: 'add' | 'edit',
  values: { notificationGroup?: string; prisonId?: string; emailAddresses?: string } = {},
  error?: { field: string; text: string },
) => {
  const prisons = type === 'prison' ? await getPrisons(req) : []
  const prison = prisons.find(item => item.id === values.prisonId)
  const title = `${mode === 'add' ? 'Add' : 'Edit'} ${type === 'default' ? 'default' : 'prison-specific'} mailbox`

  return res.render('pages/functionalMailboxes/form', {
    title,
    type,
    mode,
    values,
    prisons,
    prison,
    notificationGroups,
    role: isNotificationGroup(values.notificationGroup || '')
      ? notificationGroupLabel(values.notificationGroup as NotificationGroup)
      : undefined,
    validationErrors: error ? [{ text: error.text, href: `#${error.field}` }] : [],
    errors: error ? { [error.field]: { text: error.text } } : {},
    backLink: paths.functionalMailboxes.index,
  })
}

const addDefault = (req: Request, res: Response) => renderForm(req, res, 'default', 'add')

const addPrison = (req: Request, res: Response) => renderForm(req, res, 'prison', 'add')

const editDefault = async (req: Request, res: Response) => {
  const notificationGroup = getParam(req.params.notificationGroup)
  if (!isNotificationGroup(notificationGroup)) throw new NotFound()
  const mailbox = await req.services.locationsService.getNotificationMailbox(req.session.systemToken, notificationGroup)
  if (!mailbox) throw new NotFound()
  return renderForm(req, res, 'default', 'edit', {
    notificationGroup,
    emailAddresses: mailbox.emailAddresses.join('\n'),
  })
}

const editPrison = async (req: Request, res: Response) => {
  const notificationGroup = getParam(req.params.notificationGroup)
  const prisonId = getParam(req.params.prisonId)
  if (!isNotificationGroup(notificationGroup)) throw new NotFound()
  const mailbox = await req.services.locationsService.getNotificationMailbox(
    req.session.systemToken,
    notificationGroup,
    prisonId,
  )
  if (!mailbox) throw new NotFound()
  return renderForm(req, res, 'prison', 'edit', {
    prisonId,
    notificationGroup,
    emailAddresses: mailbox.emailAddresses.join('\n'),
  })
}

const save = async (req: Request, res: Response, type: MailboxType) => {
  const mode = req.params.notificationGroup ? 'edit' : 'add'
  const notificationGroup = req.params.notificationGroup
    ? getParam(req.params.notificationGroup)
    : String(req.body.notificationGroup || '')
  let prisonId: string | undefined
  if (type === 'prison') {
    prisonId = req.params.prisonId ? getParam(req.params.prisonId) : String(req.body.prisonId || '')
  }
  const values = { notificationGroup, prisonId, emailAddresses: String(req.body.emailAddresses || '') }

  if (!isNotificationGroup(notificationGroup)) {
    return renderForm(req, res, type, mode, values, { field: 'notificationGroup', text: 'Select a role' })
  }
  if (type === 'prison') {
    const prisons = await getPrisons(req)
    if (!prisonId || !prisons.some(prison => prison.id === prisonId)) {
      return renderForm(req, res, type, mode, values, { field: 'prisonId', text: 'Select a prison' })
    }
  }

  const emails = parseEmails(values.emailAddresses)
  if (!emails.length) {
    return renderForm(req, res, type, mode, values, {
      field: 'emailAddresses',
      text: 'Enter at least one email address',
    })
  }
  const invalid = invalidEmails(emails)
  if (invalid.length) {
    return renderForm(req, res, type, mode, values, {
      field: 'emailAddresses',
      text: `Enter a valid email address: ${invalid[0]}`,
    })
  }

  const existing = await req.services.locationsService.getNotificationMailbox(
    req.session.systemToken,
    notificationGroup,
    prisonId,
  )
  if (mode === 'add' && existing) {
    return renderForm(req, res, type, mode, values, {
      field: type === 'prison' ? 'prisonId' : 'notificationGroup',
      text: `A mailbox already exists for this ${type === 'prison' ? 'prison and role' : 'role'}`,
    })
  }
  if (mode === 'edit' && !existing) throw new NotFound()

  try {
    await req.services.locationsService.replaceNotificationMailbox(
      req.session.systemToken,
      notificationGroup,
      emails,
      prisonId,
    )
  } catch (error) {
    if (type === 'prison' && (error as SanitisedError).responseStatus === 404) {
      return renderForm(req, res, type, mode, values, {
        field: 'prisonId',
        text: 'This prison is not available in Locations',
      })
    }
    throw error
  }
  req.flash(
    'success',
    `${type === 'default' ? 'Default' : 'Prison-specific'} mailbox ${mode === 'add' ? 'added' : 'updated'}`,
  )
  return res.redirect(paths.functionalMailboxes.index)
}

const saveDefault = (req: Request, res: Response) => save(req, res, 'default')
const savePrison = (req: Request, res: Response) => save(req, res, 'prison')

export default { addDefault, addPrison, editDefault, editPrison, saveDefault, savePrison }
