import { Request, Response } from 'express'
import { NotFound } from 'http-errors'

import logger from '../../../logger'
import { PrisonConfiguration, StatusType } from '../../data/types/locationsApi'
import PrisonService from '../../services/prisonService'
import paths from '../../utils/paths'

type Setting = 'residential' | 'certification'

const settings: Record<
  Setting,
  { label: string; attribute: keyof PrisonConfiguration; analyticsEvent: string; auditEvent: string }
> = {
  residential: {
    label: 'MVP1',
    attribute: 'resiLocationServiceActive',
    analyticsEvent: 'resi_status',
    auditEvent: 'SET_RESIDENTIAL_SERVICE_STATUS',
  },
  certification: {
    label: 'Certification',
    attribute: 'certificationApprovalRequired',
    analyticsEvent: 'certification_status',
    auditEvent: 'SET_CERTIFICATION_APPROVAL_STATUS',
  },
}

const isSetting = (value: unknown): value is Setting => typeof value === 'string' && value in settings

const isStatus = (value: unknown): value is StatusType => value === 'ACTIVE' || value === 'INACTIVE'

/** Back to the list, keeping the admin on the same filtered view they acted from. */
const backToList = (search: unknown) => {
  const query = typeof search === 'string' && search ? `?${new URLSearchParams({ q: search })}` : ''
  return `${paths.prisonConfiguration.index}${query}`
}

/**
 * Blocks the NOMIS residential screen (OIMMHOLO) for a prison when MVP1 is switched on, and unblocks it when switched
 * off. Adds the prison's condition to the screen if it does not have one yet.
 */
const setNomisScreenBlocked = async (prisonService: PrisonService, token: string, prisonId: string, block: boolean) => {
  try {
    await prisonService.getScreenStatus(token, prisonId)
  } catch (error) {
    if (error.responseStatus === 404) {
      await prisonService.addCondition(token, prisonId, block)
      return
    }
    throw error
  }
  await prisonService.updateScreen(token, prisonId, block)
}

const list = async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  const prisons = await locationsService.getAllPrisonConfigurations(req.session.systemToken)

  const needle = search.toLowerCase()
  const filtered = needle
    ? prisons.filter(
        prison => prison.prisonName?.toLowerCase().includes(needle) || prison.prisonId.toLowerCase().includes(needle),
      )
    : prisons

  const [success] = req.flash('success')
  const [error] = req.flash('error')

  return res.render('pages/prisonConfiguration/index', {
    title: 'Manage prisons',
    prisons: filtered,
    search,
    residentialCount: prisons.filter(prison => prison.resiLocationServiceActive === 'ACTIVE').length,
    certificationCount: prisons.filter(prison => prison.certificationApprovalRequired === 'ACTIVE').length,
    totalCount: prisons.length,
    banner: success ? { success } : undefined,
    errorBanner: error,
    paths,
  })
}

const update = async (req: Request, res: Response) => {
  const { analyticsService, auditService, locationsService, prisonService } = req.services
  const { systemToken } = req.session
  const prisonId = String(req.params.prisonId)
  const { setting } = req.params
  const { status } = req.body
  if (!isSetting(setting) || !isStatus(status)) throw new NotFound()

  const prisonName = typeof req.body.name === 'string' && req.body.name ? req.body.name : prisonId
  const { label, analyticsEvent, auditEvent } = settings[setting]
  const switchedOn = status === 'ACTIVE'

  if (setting === 'residential') {
    await locationsService.updateResiStatus(systemToken, prisonId, status)
  } else {
    await locationsService.updateCertificationApproval(systemToken, prisonId, status)
  }

  analyticsService.sendEvent(req, analyticsEvent, { prison_id: prisonId, status })
  await auditService.logAuditEvent({
    what: auditEvent,
    who: res.locals.user.username,
    subjectId: prisonId,
    subjectType: 'PRISON_ID',
    correlationId: req.id,
    details: { status },
  })

  if (setting === 'residential') {
    try {
      await setNomisScreenBlocked(prisonService, systemToken, prisonId, switchedOn)
    } catch (error) {
      logger.error(`Failed to ${switchedOn ? 'block' : 'unblock'} the NOMIS residential screen for ${prisonId}`, error)
      req.flash('error', {
        title: `MVP1 is switched ${switchedOn ? 'on' : 'off'} for ${prisonName}`,
        content: `The NOMIS residential screen could not be ${switchedOn ? 'blocked' : 'unblocked'}. Switch MVP1 ${
          switchedOn ? 'off and on' : 'on and off'
        } again to retry.`,
      })
      return res.redirect(backToList(req.body.q))
    }
  }

  req.flash('success', {
    title: `${label} switched ${switchedOn ? 'on' : 'off'}`,
    content: `${label} is now switched ${switchedOn ? 'on' : 'off'} for ${prisonName}.`,
  })
  return res.redirect(backToList(req.body.q))
}

export default { list, update }
