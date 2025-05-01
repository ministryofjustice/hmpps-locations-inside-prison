import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { PrisonResidentialSummary } from '../../data/types/locationsApi/prisonResidentialSummary'

export default class ChangeSignedOperationalCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getSignedOperationalCapacity)
  }

  async getSignedOperationalCapacity(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { locationsService, manageUsersService } = req.services

    const token = await req.services.authService.getSystemClientToken(user.username)
    try {
      const signedOperationalCapacitySummary = await locationsService.getSignedOperationalCapacity(
        token,
        res.locals.prisonId,
      )
      const whenUpdated = new Date(signedOperationalCapacitySummary.whenUpdated)
      const whenUpdatedWeekday = whenUpdated.toLocaleString('en', { weekday: 'long' })
      const whenUpdatedDay = whenUpdated.getDate()
      const whenUpdatedMonth = whenUpdated.toLocaleString('en', { month: 'long' })
      const whenUpdatedYear = whenUpdated.toLocaleString('en', { year: 'numeric' })
      const { updatedBy: updatedByUsername } = signedOperationalCapacitySummary || {}
      const updatedBy: string = updatedByUsername
        ? (await manageUsersService.getUser(res.locals.user.token, updatedByUsername))?.name || updatedByUsername
        : updatedByUsername
      res.locals.lastUpdate = {
        time: whenUpdated.toLocaleString('en', { timeStyle: 'short', hour12: false }),
        date: `${whenUpdatedWeekday} ${whenUpdatedDay} ${whenUpdatedMonth} ${whenUpdatedYear}`,
        updatedBy,
      }
      res.locals.currentSignedOperationalCapacity = signedOperationalCapacitySummary.signedOperationCapacity
    } catch (e) {
      if (e.responseStatus === 404) {
        res.locals.currentSignedOperationalCapacity = 0
      } else {
        throw e
      }
    }

    const residentialSummary = (await locationsService.getResidentialSummary(
      token,
      res.locals.prisonId,
    )) as PrisonResidentialSummary
    res.locals.maxCapacity = residentialSummary?.prisonSummary?.maxCapacity

    next()
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, (errors: FormWizard.Errors) => {
      const { values } = req.form
      const { maxCapacity } = res.locals

      const validationErrors: FormWizard.Errors = {}

      if (!errors.newSignedOperationalCapacity) {
        const { newSignedOperationalCapacity } = values
        if (Number(newSignedOperationalCapacity) > Number(maxCapacity)) {
          validationErrors.newSignedOperationalCapacity = this.formError(
            'newSignedOperationalCapacity',
            'doesNotExceedEstMaxCap',
          )
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals
    const { newSignedOperationalCapacity } = req.form.values
    const { currentSignedOperationalCapacity } = res.locals
    if (Number(newSignedOperationalCapacity) === Number(currentSignedOperationalCapacity)) {
      return res.redirect(
        backUrl(req, {
          fallbackUrl: `/view-and-update-locations/${prisonId}`,
        }),
      )
    }

    return next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { prisonId, user } = res.locals
      const { locationsService } = req.services
      const { newSignedOperationalCapacity } = req.form.values
      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.updateSignedOperationalCapacity(
        token,
        prisonId,
        Number(newSignedOperationalCapacity),
        user.username,
      )

      req.services.analyticsService.sendEvent(req, 'change_signed_op_cap', { prison_id: prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Signed operational capacity updated',
      content: `You have updated the establishment's signed operational capacity.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}`)
  }
}
