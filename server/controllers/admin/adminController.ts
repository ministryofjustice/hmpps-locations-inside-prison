import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import backUrl from '../../utils/backUrl'
import { PrisonConfiguration, StatusType } from '../../data/types/locationsApi'
import capFirst from '../../formatters/capFirst'
import paths from '../../utils/paths'

export default function adminController({
  name,
  attribute,
  analyticsEvent,
  apiCalls,
}: {
  name: string
  attribute: keyof PrisonConfiguration
  analyticsEvent: string
  apiCalls: (req: FormWizard.Request, res: Response) => Promise<void>
}) {
  return class extends FormStep {
    override locals(req: FormWizard.Request, res: Response): TypedLocals {
      const locals = super.locals(req, res)
      const { prisonConfiguration } = res.locals
      const { prisonId } = prisonConfiguration

      const backLink = backUrl(req, {
        fallbackUrl: paths.admin.index(prisonId),
      })

      return {
        ...locals,
        backLink,
        cancelLink: backLink,
        title: `Update ${name} status`,
        adminSubject: { name, attribute },
        buttonText: `${prisonConfiguration[attribute] === 'INACTIVE' ? 'Activate' : 'Deactivate'} ${name}`,
      }
    }

    override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
      const { prisonId } = res.locals.prisonConfiguration
      const { analyticsService } = req.services
      const { activation } = req.form.values
      const status = activation as StatusType

      try {
        await apiCalls(req, res)

        analyticsService.sendEvent(req, analyticsEvent, {
          prison_id: prisonId,
          status,
        })
        return next()
      } catch (error) {
        return next(error)
      }
    }

    override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
      const { prisonId } = res.locals.prisonConfiguration

      req.journeyModel.reset()
      req.sessionModel.reset()

      req.flash('success', {
        title: `${capFirst(name)} status`,
        content: `You have changed the ${name} status.`,
      })

      res.redirect(paths.admin.index(prisonId))
    }
  }
}
