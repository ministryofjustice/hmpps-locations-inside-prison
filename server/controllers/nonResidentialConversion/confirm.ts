import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class NonResidentialConversionConfirm extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const convertedCellType = req.sessionModel.get('convertedCellType') as { text: string; value: string }
    let convertedCellTypeDetails = convertedCellType?.text
    const otherConvertedCellType = req.sessionModel.get('otherConvertedCellType') as string
    if (otherConvertedCellType?.length) {
      convertedCellTypeDetails += ` - ${otherConvertedCellType}`
    }

    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity
    const { prisonResidentialSummary } = res.locals

    const changeSummaries = compact([
      generateChangeSummary(
        'working capacity',
        workingCapacity,
        0,
        prisonResidentialSummary.prisonSummary.workingCapacity,
      ),
      generateChangeSummary('maximum capacity', maxCapacity, 0, prisonResidentialSummary.prisonSummary.maxCapacity),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
      convertedCellTypeDetails,
      title: 'Confirm conversion to non-residential room',
      titleCaption: capFirst(decoratedLocation.displayName),
      buttonText: 'Confirm conversion',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const convertedCellType = req.sessionModel.get('convertedCellType') as { text: string; value: string }
      let otherConvertedCellType = req.sessionModel.get('otherConvertedCellType') as string
      if (!otherConvertedCellType?.length) {
        otherConvertedCellType = undefined
      }

      await locationsService.convertCellToNonResCell(
        req.session.systemToken,
        decoratedLocation.id,
        convertedCellType?.value,
        otherConvertedCellType,
      )

      analyticsService.sendEvent(req, 'convert_to_non_res', {
        prison_id: decoratedLocation.prisonId,
        converted_cell_type: convertedCellType.value,
      })

      return next()
    } catch (error) {
      if (error.data?.errorCode === 109) {
        analyticsService.sendEvent(req, 'handled_error', {
          prison_id: decoratedLocation.prisonId,
          error_code: 109,
        })

        return res.redirect(`/location/${decoratedLocation.id}/non-residential-conversion/occupied`)
      }
      return next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, localName, pathHierarchy, prisonId } = res.locals.decoratedLocation
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
