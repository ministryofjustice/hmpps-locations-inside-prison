import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class ChangeNonResidentialTypeDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const convertedCellType = await req.services.locationsService.getConvertedCellTypes(token)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellType).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, any> {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services
      const token = await req.services.authService.getSystemClientToken(user.username)
      const { options, values } = req.form
      const { items } = options.fields.convertedCellType
      const found = items.find(item => item.value === values.convertedCellType)
      const convertedCellType: string = found ? String(found.value) : ''
      await locationsService.changeNonResType(token, res.locals.location.id, convertedCellType)
      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId, localName, pathHierarchy } = res.locals.location
    const locationName = localName || pathHierarchy

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'changed non residential type',
      content: `You have changed non residential type for ${locationName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
