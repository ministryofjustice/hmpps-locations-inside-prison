import { Request, Response } from 'express'

import paths from '../../utils/paths'
import { isLocationsPrison, notificationGroupLabel, notificationGroups } from './constants'

export default async (req: Request, res: Response) => {
  const { locationsService, manageUsersService } = req.services
  const { systemToken } = req.session
  const prisons = (await manageUsersService.getCaseloads(systemToken))
    .filter(prison => isLocationsPrison(prison.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const defaultMailboxes = (
    await Promise.all(
      notificationGroups.map(group => locationsService.getNotificationMailbox(systemToken, group.value)),
    )
  )
    .filter(mailbox => mailbox !== undefined)
    .map(mailbox => ({ ...mailbox, role: notificationGroupLabel(mailbox.notificationGroup) }))

  const prisonNames = new Map(prisons.map(prison => [prison.id, prison.name]))
  const prisonMailboxes = (await locationsService.getPrisonNotificationMailboxes(systemToken))
    .filter(mailbox => mailbox.prisonId && prisonNames.has(mailbox.prisonId))
    .map(mailbox => ({
      ...mailbox,
      prisonId: mailbox.prisonId as string,
      prisonName: prisonNames.get(mailbox.prisonId) as string,
      role: notificationGroupLabel(mailbox.notificationGroup),
    }))

  const success = req.flash('success')
  return res.render('pages/functionalMailboxes/index', {
    title: 'Manage functional mailboxes',
    defaultMailboxes,
    prisonMailboxes,
    banner: success?.length ? { success: { title: success[0], content: '' } } : undefined,
    paths,
  })
}
