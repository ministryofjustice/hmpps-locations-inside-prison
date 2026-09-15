import { Request, Response } from 'express'
import { NotFound } from 'http-errors'

import { NotificationGroup } from '../../data/types/locationsApi'
import paths from '../../utils/paths'
import { isLocationsPrison, isNotificationGroup, notificationGroupLabel } from './constants'

type MailboxType = 'default' | 'prison'

const getParam = (value: string | string[]) => (Array.isArray(value) ? value[0] : value)

const getMailboxDetails = async (req: Request, type: MailboxType) => {
  const notificationGroup = getParam(req.params.notificationGroup)
  const prisonId = getParam(req.params.prisonId)
  if (!isNotificationGroup(notificationGroup)) throw new NotFound()
  const mailbox = await req.services.locationsService.getNotificationMailbox(
    req.session.systemToken,
    notificationGroup,
    type === 'prison' ? prisonId : undefined,
  )
  if (!mailbox) throw new NotFound()

  const prison =
    type === 'prison'
      ? (await req.services.manageUsersService.getCaseloads(req.session.systemToken)).find(
          item => isLocationsPrison(item.id) && item.id === prisonId,
        )
      : undefined
  if (type === 'prison' && !prison) throw new NotFound()

  return { mailbox, prison, notificationGroup }
}

const confirm = async (req: Request, res: Response, type: MailboxType) => {
  const { mailbox, prison, notificationGroup } = await getMailboxDetails(req, type)
  return res.render('pages/functionalMailboxes/delete', {
    title: `Delete ${type === 'default' ? 'default' : 'prison-specific'} mailbox`,
    type,
    role: notificationGroupLabel(notificationGroup as NotificationGroup),
    prison,
    mailbox,
    backLink: paths.functionalMailboxes.index,
  })
}

const remove = async (req: Request, res: Response, type: MailboxType) => {
  const { notificationGroup } = await getMailboxDetails(req, type)
  const prisonId = getParam(req.params.prisonId)
  await req.services.locationsService.deleteNotificationMailbox(
    req.session.systemToken,
    notificationGroup,
    type === 'prison' ? prisonId : undefined,
  )
  req.flash('success', `${type === 'default' ? 'Default' : 'Prison-specific'} mailbox deleted`)
  return res.redirect(paths.functionalMailboxes.index)
}

const confirmDefault = (req: Request, res: Response) => confirm(req, res, 'default')
const confirmPrison = (req: Request, res: Response) => confirm(req, res, 'prison')
const deleteDefault = (req: Request, res: Response) => remove(req, res, 'default')
const deletePrison = (req: Request, res: Response) => remove(req, res, 'prison')

export default { confirmDefault, confirmPrison, deleteDefault, deletePrison }
