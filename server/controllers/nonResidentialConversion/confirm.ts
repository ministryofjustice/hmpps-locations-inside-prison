import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import generateChangeSummary from '../../lib/generateChangeSummary'

export default class NonResidentialConversionConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getResidentialSummary)
  }

  async getResidentialSummary(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { locationsService } = req.services

    const token = await req.services.authService.getSystemClientToken(user.username)
    res.locals.residentialSummary = await locationsService.getResidentialSummary(token, res.locals.location.prisonId)

    next()
  }

  locals(req: FormWizard.Request, res: Response): object {
    const convertedCellType = req.sessionModel.get('convertedCellType') as { text: string; value: string }
    let convertedCellTypeDetails = convertedCellType?.text
    const otherConvertedCellType = req.sessionModel.get('otherConvertedCellType') as string
    if (otherConvertedCellType?.length) {
      convertedCellTypeDetails += ` - ${otherConvertedCellType}`
    }

    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const { maxCapacity, workingCapacity } = location.capacity
    const { residentialSummary } = res.locals

    const changeSummaries = compact([
      generateChangeSummary('working capacity', workingCapacity, 0, residentialSummary.prisonSummary.workingCapacity),
      generateChangeSummary('maximum capacity', maxCapacity, 0, residentialSummary.prisonSummary.maxCapacity),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
      convertedCellTypeDetails,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services
      const convertedCellType = req.sessionModel.get('convertedCellType') as { text: string; value: string }
      let otherConvertedCellType = req.sessionModel.get('otherConvertedCellType') as string
      if (!otherConvertedCellType?.length) {
        otherConvertedCellType = undefined
      }

      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.convertCellToNonResCell(
        token,
        res.locals.location.id,
        convertedCellType?.value,
        otherConvertedCellType,
      )

      return next()
    } catch (error) {
      if (error.data?.errorCode === 109) {
        req.form.options.next = 'occupied'
        return next()
      }
      return next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, localName, pathHierarchy, prisonId } = res.locals.location
    const locationName = localName || pathHierarchy

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell converted to non-residential room',
      content: `You have converted ${locationName} into a non-residential room.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}