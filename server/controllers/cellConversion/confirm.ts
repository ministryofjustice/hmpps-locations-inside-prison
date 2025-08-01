import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import { SummaryListRow } from '../../@types/govuk'
import { TypedLocals } from '../../@types/express'

export default class CellConversionConfirm extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  async get(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService } = req.services

    const { systemToken } = req.session
    const accommodationType = await locationsService.getAccommodationType(
      systemToken,
      req.sessionModel.get<string>('accommodationType'),
    )
    const specialistCellTypeKeys = req.sessionModel.get<string[]>('specialistCellTypes')
    const specialistCellTypes =
      specialistCellTypeKeys &&
      (await Promise.all(specialistCellTypeKeys.map(key => locationsService.getSpecialistCellType(systemToken, key))))
    const usedForTypeKeys = req.sessionModel.get<string[]>('usedForTypes')
    const usedForTypes =
      usedForTypeKeys &&
      (await Promise.all(usedForTypeKeys.map(key => locationsService.getUsedForType(systemToken, key))))

    res.locals = {
      ...res.locals,
      accommodationType,
      maxCapacity: req.sessionModel.get<string>('maxCapacity'),
      specialistCellTypes,
      usedForTypes,
      workingCapacity: req.sessionModel.get<string>('workingCapacity'),
    }

    super.get(req, res, next)
  }

  toSummaryListRow(
    labelText: string,
    formValue: string | string[] | undefined,
    actionHref: string,
    actionText = 'Change',
  ) {
    const value = formValue && (typeof formValue === 'string' ? { text: formValue } : { html: formValue?.join('<br>') })

    return {
      key: {
        text: labelText,
      },
      value,
      actions: {
        items: [
          {
            href: actionHref,
            text: actionText,
            classes: 'govuk-link--no-visited-state',
          },
        ],
      },
    }
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const { sessionModel } = req
    const {
      accommodationType,
      decoratedLocation,
      maxCapacity,
      prisonResidentialSummary,
      specialistCellTypes,
      usedForTypes,
      workingCapacity,
    } = res.locals
    const { id: locationId } = decoratedLocation

    sessionModel.unset('previousCellTypes')
    sessionModel.unset('previousAccommodationType')

    const editLink = (step: string) => `/location/${locationId}/cell-conversion/${step}/edit`

    const summaryListRows: SummaryListRow[] = compact([
      this.toSummaryListRow('Accommodation type', accommodationType, editLink('accommodation-type')),
      usedForTypes && this.toSummaryListRow('Used for', usedForTypes, editLink('used-for')),
      this.toSummaryListRow('Cell type', specialistCellTypes || 'None', editLink('specific-cell-type')),
      this.toSummaryListRow('Working capacity', String(workingCapacity), editLink('set-cell-capacity')),
      this.toSummaryListRow('Maximum capacity', String(maxCapacity), editLink('set-cell-capacity')),
    ])

    const changeSummaries = compact([
      generateChangeSummary(
        'working capacity',
        0,
        Number(workingCapacity),
        prisonResidentialSummary.prisonSummary.workingCapacity,
      ),
      generateChangeSummary(
        'maximum capacity',
        0,
        Number(maxCapacity),
        prisonResidentialSummary.prisonSummary.maxCapacity,
      ),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    return {
      changeSummary,
      summaryListRows,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { services, sessionModel } = req
      const { locationsService } = services
      const accommodationType = sessionModel.get<string>('accommodationType')
      const specialistCellTypes = sessionModel.get<string[]>('specialistCellTypes')
      const maxCapacity = sessionModel.get<number>('maxCapacity')
      const workingCapacity = sessionModel.get<number>('workingCapacity')
      const usedForTypes = sessionModel.get<string[]>('usedForTypes')

      await locationsService.convertToCell(
        req.session.systemToken,
        decoratedLocation.id,
        accommodationType,
        specialistCellTypes,
        maxCapacity,
        workingCapacity,
        usedForTypes,
      )

      req.services.analyticsService.sendEvent(req, 'convert_to_cell', {
        prison_id: decoratedLocation.prisonId,
        accommodation_type: accommodationType,
      })

      return next()
    } catch (error) {
      return next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, localName, pathHierarchy, prisonId } = res.locals.decoratedLocation
    const locationName = localName || pathHierarchy

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Non-residential room converted to a cell',
      content: `You have converted ${locationName} into a cell.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
