import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import { singularizeString } from '../../utils/utils'
import paths from '../../utils/paths'
import addAction from '../../middleware/addAction'
import populateTopLevelDraftLocationSummary from '../../middleware/populateTopLevelDraftLocationSummary'
import populateBreadcrumbsForLocation from '../../middleware/populateBreadcrumbsForLocation'
import logPageView from '../../middleware/logPageView'
import { Page } from '../../services/auditService'
import addBreadcrumb from '../../middleware/addBreadcrumb'
import middleware from '../../middleware/middleware'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'

export const addActions = middleware((req, res, next?) => {
  const { location } = res.locals.decoratedResidentialSummary
  const { active, inactiveStatus, isResidential, leafLevel, raw, status } = location
  const { locationType } = raw
  const requiredPermission = locationType === 'CELL' ? 'deactivate' : 'deactivate:parent_location'

  if (
    active &&
    isResidential &&
    ['CELL', 'LANDING', 'WING', 'SPUR'].includes(locationType) &&
    !status.includes('LOCKED_') &&
    req.canAccess(requiredPermission)
  ) {
    addAction({
      text: `Deactivate ${location.locationType.toLowerCase()}`,
      href: paths.location.deactivate(location),
    })(req, res, null)
  } else if (!active && status === 'DRAFT' && req.canAccess('create_location')) {
    addAction({
      text: `Delete ${location.locationType.toLowerCase()}`,
      href: paths.location.delete(location),
      class: 'govuk-button--warning',
    })(req, res, null)
  }

  if (req.canAccess('convert_non_residential') && active && isResidential && leafLevel && !status.includes('LOCKED_')) {
    addAction({
      text: `Convert cell to non-residential room`,
      href: paths.location.nonResidentialConversion(location),
    })(req, res, null)
  }

  if (
    !active &&
    ['INACTIVE_TEMP', 'INACTIVE_MATCHING_CELL_CERT'].includes(inactiveStatus) &&
    req.canAccess('archive_location')
  ) {
    addAction({
      text: `Archive ${location.locationType.toLowerCase()}`,
      href: paths.location.archive(location),
    })(req, res, null)
  }

  if (next) {
    next()
  }
})

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    title: 'Manage residential locations',
    minLayout: 'three-quarters',
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  await populateDecoratedResidentialSummary(req, res)

  const isShowView = !!res.locals.locationId
  if (isShowView) {
    await populateTopLevelDraftLocationSummary(req, res)
    populateBreadcrumbsForLocation(req, res)
    await logPageView(req.services.auditService, Page.LOCATIONS_SHOW)(req, res)
    addActions(req, res)

    const { decoratedResidentialSummary: summary } = res.locals
    const { location } = summary
    const { active, isResidential, leafLevel } = location
    const pendingApproval = location.pendingApprovalRequestId

    if (!pendingApproval && req.canAccess('create_location')) {
      if (!leafLevel) {
        const singularizedLocationType = singularizeString(summary.subLocationName).toLowerCase()
        let createButton = {
          text: `Create new ${singularizedLocationType}`,
          href: paths.location.create(location),
          classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
          attributes: {
            'data-qa': 'create-button',
          },
        }

        if (summary.subLocationName === 'Cells') {
          const hasAnyDraftCells = summary.subLocations.some(l => l.status === 'DRAFT')
          if (hasAnyDraftCells) {
            createButton = {
              ...createButton,
              text: 'Edit cells',
              href: paths.location.editCells(location),
            }

            const hasAnyNonDraftCells = summary.subLocations.some(l => l.status !== 'DRAFT')
            if (hasAnyNonDraftCells) {
              createButton.text = 'Edit draft cells'
            }
          } else {
            createButton = {
              ...createButton,
              text: 'Create new cells',
              href: paths.location.createCells(location),
            }
          }
        }

        locals.createButton = createButton
      }
    }

    if (
      req.canAccess('convert_non_residential') &&
      active &&
      !isResidential &&
      leafLevel &&
      !location.status.includes('LOCKED_')
    ) {
      addAction({
        text: 'Convert to cell',
        href: paths.location.cellConversion(location),
      })(req, res, null)
    }
  } else {
    addBreadcrumb({ title: '', href: '/' })(req, res)
    await logPageView(req.services.auditService, Page.LOCATIONS_INDEX)(req, res)

    if (req.canAccess('create_location')) {
      const { decoratedResidentialSummary: summary, prisonId } = res.locals
      const singularizedLocationType = singularizeString(String(summary.subLocationName)).toLowerCase()

      locals.createButton = {
        text: `Create new ${singularizedLocationType}`,
        href: paths.location.create(prisonId),
        classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
        attributes: {
          'data-qa': 'create-button',
        },
      }
    }
  }

  return res.render(`pages/viewLocations/${isShowView ? 'show' : 'index'}`, locals)
}
