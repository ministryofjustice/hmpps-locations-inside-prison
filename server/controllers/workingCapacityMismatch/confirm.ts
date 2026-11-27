import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { compact, lowerFirst } from 'lodash'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import generateChangeSummary from '../../lib/generateChangeSummary'
import paths from '../../utils/paths'
import getResidentialSummaries from '../reactivate/parent/middleware/getResidentialSummaries'
import otherCertificateDifferences from './otherCertificateDifferences'

export default class ConfirmController extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummaries)
  }

  generateChangeSummary(valName: string, oldVal: number, newVal: number, overallVal?: number): string | null {
    if (newVal === oldVal) return null

    const verb = newVal > oldVal ? 'increasing' : 'decreasing'
    const diff = newVal - oldVal
    const establishmentSummary =
      overallVal === undefined ? null : generateChangeSummary(`total ${valName}`, oldVal, newVal, overallVal)

    return [`You are ${verb} the cell’s ${valName} by ${Math.abs(diff)}.`, establishmentSummary]
      .filter(Boolean)
      .join('\n<br/><br/>\n')
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    const { locationResidentialSummary, prisonResidentialSummary } = res.locals
    const { parentLocation } = locationResidentialSummary
    const { prisonSummary } = prisonResidentialSummary
    const differences = otherCertificateDifferences(parentLocation)

    locals.otherCertificateDifferences = differences
    locals.changeSummary = compact([
      this.generateChangeSummary(
        'working capacity',
        parentLocation.capacity.workingCapacity,
        parentLocation.currentCellCertificate.workingCapacity,
        prisonSummary.workingCapacity,
      ),
      ...differences.map(({ label, current, certified }) =>
        this.generateChangeSummary(
          lowerFirst(label),
          current,
          certified,
          label === 'Maximum capacity' ? prisonSummary.maxCapacity : undefined,
        ),
      ),
    ]).join('\n<br/><br/>\n')
    locals.buttonText = 'Update cell capacity'

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { parentLocation } = res.locals.locationResidentialSummary
    const { currentCellCertificate } = parentLocation
    const { locationsService } = req.services
    const { systemToken } = req.session

    try {
      // Send every certified value, not only the working capacity. If the cell's own max capacity or CNA were sent
      // where they differ from the certificate, the API would raise a request to put them on the certificate.
      const updatedLocation = await locationsService.updateCapacity(systemToken, parentLocation.id, {
        maxCapacity: currentCellCertificate.maxCapacity,
        workingCapacity: currentCellCertificate.workingCapacity,
        certifiedNormalAccommodation: currentCellCertificate.certifiedNormalAccommodation,
        temporaryWorkingCapacityChange: true,
      })
      res.locals.capacityChangeSentForApproval = Boolean(updatedLocation?.pendingApprovalRequestId)

      req.services.analyticsService.sendEvent(req, 'working_capacity_match_certificate', {
        prison_id: parentLocation.prisonId,
      })
    } catch (e) {
      next(e)
      return
    }

    next()
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const {
      capacityChangeSentForApproval,
      location,
      location: { pathHierarchy },
    } = res.locals

    req.journeyModel.reset()
    req.sessionModel.reset()

    // Should not happen now the certified values are sent, but never tell the user the cell changed when it did not
    req.flash(
      'success',
      capacityChangeSentForApproval
        ? {
            title: 'Change request sent',
            content: `The capacity for ${pathHierarchy} has not changed yet. You have submitted a request to update the cell certificate.`,
          }
        : {
            title: 'Capacity updated',
            content: `You have updated the capacity for ${pathHierarchy}.`,
          },
    )

    res.redirect(paths.location.view(location))
  }
}
