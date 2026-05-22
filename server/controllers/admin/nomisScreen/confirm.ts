import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { ModuleName } from '../../../data/types/locationsApi/moduleName'
import PrisonService from '../../../services/prisonService'

type ScreenStatus = 'ACCESSIBLE' | 'WARNING' | 'BLOCKED'
type NomisModuleName = Exclude<ModuleName, 'OIMMHOLO'>

const SCREEN_LABELS: Record<NomisModuleName, string> = {
  OIMILOCA: 'Maintain internal locations (OIMILOCA)',
  OIMULOCA: 'Maintain internal usage (OIMULOCA)',
}

const STATUS_DESCRIPTIONS: Record<ScreenStatus, string> = {
  ACCESSIBLE: 'Accessible',
  WARNING: 'Warning shown',
  BLOCKED: 'Blocked',
}

function parseModuleName(value: unknown): NomisModuleName {
  if (value !== 'OIMILOCA' && value !== 'OIMULOCA') {
    throw new Error(`Unsupported NOMIS screen module: ${value}`)
  }
  return value
}

async function fetchStatus(
  prisonService: PrisonService,
  token: string,
  prisonId: string,
  moduleName: NomisModuleName,
): Promise<ScreenStatus> {
  try {
    const condition = await prisonService.getScreenStatus(token, prisonId, moduleName)
    return condition.blockAccess ? 'BLOCKED' : 'WARNING'
  } catch (error) {
    if (error.responseStatus === 404) {
      return 'ACCESSIBLE'
    }
    throw error
  }
}

export default class NomisScreenStatusChangeConfirm extends FormInitialStep {
  override middlewareSetup() {
    this.use(this.loadCurrentStatus.bind(this))
    super.middlewareSetup()
  }

  async loadCurrentStatus(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const moduleName = parseModuleName(res.locals.moduleName)
      const { prisonId } = res.locals.prisonConfiguration
      res.locals.currentScreenStatus = await fetchStatus(
        req.services.prisonService,
        req.session.systemToken,
        prisonId,
        moduleName,
      )
      next()
    } catch (error) {
      next(error)
    }
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { prisonConfiguration, moduleName, currentScreenStatus } = res.locals
    const { prisonId } = prisonConfiguration
    const screenLabel = SCREEN_LABELS[moduleName as NomisModuleName]

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}`,
    })

    const fields = { ...(locals.fields as FormWizard.Fields) }
    const selected = (req.form.values.screenStatus as ScreenStatus) || (currentScreenStatus as ScreenStatus)
    fields.screenStatus = {
      ...fields.screenStatus,
      items: fields.screenStatus.items.map(item => ({
        ...item,
        checked: item.value === selected,
      })),
    }

    return {
      ...locals,
      fields,
      backLink,
      cancelLink: backLink,
      title: `Update ${screenLabel} status`,
      screenLabel,
      currentStatusDescription: STATUS_DESCRIPTIONS[currentScreenStatus as ScreenStatus],
      buttonText: 'Save',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const { analyticsService, prisonService } = req.services
    const moduleName = res.locals.moduleName as NomisModuleName
    const currentStatus = res.locals.currentScreenStatus as ScreenStatus
    const status = req.form.values.screenStatus as ScreenStatus

    try {
      const conditionExists = currentStatus !== 'ACCESSIBLE'

      if (status === 'ACCESSIBLE') {
        if (conditionExists) {
          await prisonService.removeCondition(req.session.systemToken, prisonId, moduleName)
        }
      } else {
        const block = status === 'BLOCKED'
        if (conditionExists) {
          await prisonService.updateScreen(req.session.systemToken, prisonId, block, moduleName)
        } else {
          await prisonService.addCondition(req.session.systemToken, prisonId, block, moduleName)
        }
      }

      analyticsService.sendEvent(req, 'nomis_screen_status', {
        prison_id: prisonId,
        module_name: moduleName,
        status,
      })
      return next()
    } catch (error) {
      return next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const moduleName = res.locals.moduleName as NomisModuleName

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${SCREEN_LABELS[moduleName]} status`,
      content: `You have changed the ${SCREEN_LABELS[moduleName]} status.`,
    })

    res.redirect(`/admin/${prisonId}`)
  }
}
