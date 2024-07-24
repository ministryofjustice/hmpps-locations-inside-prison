import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'

export default class ChangeSignedOperationalCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getSignedOperationalCapacity)
  }

  async getSignedOperationalCapacity(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { locationsService, manageUsersService } = req.services

    const token = await req.services.authService.getSystemClientToken(user.username)
    res.locals.signedOperationalCapacitySummary = await locationsService.getSignedOperationalCapacity(
      token,
      res.locals.prisonId,
    )
    res.locals.currentSignedOperationalCapacity = res.locals.signedOperationalCapacitySummary?.signedOperationCapacity
    res.locals.whenUpdated = new Date(res.locals.signedOperationalCapacitySummary?.whenUpdated)
    res.locals.whenUpdatedWeekday = res.locals.whenUpdated.toLocaleString('en', { weekday: 'long' })
    res.locals.whenUpdatedDay = res.locals.whenUpdated.getDate()
    res.locals.whenUpdatedMonth = res.locals.whenUpdated.toLocaleString('en', { month: 'long' })
    res.locals.whenUpdatedYear = res.locals.whenUpdated.toLocaleString('en', { year: 'numeric' })
    res.locals.whenUpdatedTime = res.locals.whenUpdated.toLocaleString('en', { timeStyle: 'short', hour12: false })

    res.locals.residentialSummary = await locationsService.getResidentialSummary(token, res.locals.prisonId)
    res.locals.maxCapacity = res.locals.residentialSummary?.prisonSummary?.maxCapacity

    const { updatedBy } = res.locals.signedOperationalCapacitySummary || {}
    res.locals.updatedBy = updatedBy
      ? (await manageUsersService.getUser(res.locals.user.token, updatedBy))?.name || updatedBy
      : updatedBy

    next()
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { maxCapacity } = res.locals

      const validationErrors: any = {}

      if (!errors.newSignedOperationalCapacity) {
        const { newSignedOperationalCapacity } = values
        if (newSignedOperationalCapacity === undefined || newSignedOperationalCapacity === '') {
          validationErrors.newSignedOperationalCapacity = this.formError('newSignedOperationalCapacity', 'notBlank')
        } else if (Number.isNaN(newSignedOperationalCapacity)) {
          validationErrors.newSignedOperationalCapacity = this.formError('newSignedOperationalCapacity', 'nonNumeric')
        } else if (Number(newSignedOperationalCapacity) > Number(maxCapacity)) {
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
      return res.redirect(`/change-signed-operational-capacity/${prisonId}/cancel`)
    }

    return next()
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/change-signed-operational-capacity/${prisonId}/cancel`,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services
      const { newSignedOperationalCapacity } = req.form.values
      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.updateSignedOperationalCapacity(
        token,
        res.locals.prisonId,
        Number(newSignedOperationalCapacity),
        user.username,
      )

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
