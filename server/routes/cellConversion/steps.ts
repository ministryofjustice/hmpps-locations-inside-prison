import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import CellConversionAccommodationType from '../../controllers/cellConversion/accommodationType'
import CellConversionUsedFor from '../../controllers/cellConversion/usedFor'
import CellConversionSpecificCellType from '../../controllers/cellConversion/specificCellType'
import CellConversionSetCellType from '../../controllers/cellConversion/setCellType'
import CellConversionSetCellCapacity from '../../controllers/cellConversion/setCellCapacity'
import CellConversionConfirm from '../../controllers/cellConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import CellConversionDoorNumber from '../../controllers/cellConversion/doorNumber'
import CellConversionCapacity from '../../controllers/cellConversion/capacity'
import SetCellType from '../../commonTransactions/setCellType'
import RemoveCellType from '../../controllers/cellConversion/removeCellType'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import FormInitialStep from '../../controllers/base/formInitialStep'

function wrapSetCellTypeController(path: string, step: FormWizard.Step) {
  if (path === '/set-cell-type/init') {
    return class WrappedSetCellTypeController extends step.controller {
      override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
        const pathPrefix = req.form.options.fullPath.replace(/\/set-cell-type\/.*/, '')
        const history = req.journeyModel.get('history') as FormWizard.HistoryStep[]

        this.addJourneyHistoryStep(req, res, {
          path: history.find(item => {
            return item.next.endsWith('/capacity')
          }).next,
          next: `${pathPrefix}/set-cell-type/type`,
          wizard: req.form.options.name,
          revalidate: false,
          skip: false,
          editing: req.isEditing && !req.notRevalidated ? true : undefined,
          continueOnEdit: req.isEditing && !req.notRevalidated ? true : undefined,
        })
        super.successHandler(req, res, next)
      }
    }
  }

  if (path === '/set-cell-type/type') {
    return class extends step.controller {
      override async getValues(
        req: FormWizard.Request,
        res: Response,
        callback: (err: Error, values?: FormWizard.Values) => void,
      ) {
        if (req.sessionModel.get<boolean>(`temp-cellTypes-removed`)) {
          return super.getValues(req, res, callback)
        }

        const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

        return super.getValues(req, res, (err: Error, values?: FormWizard.Values) => {
          const accommodationTypeKey = Object.keys(req.form.options.fields).find(f => f.includes('accommodationType'))

          const types =
            req.sessionModel.get<string[]>(`temp-cellTypes`) || req.sessionModel.get<string[]>(`saved-cellTypes`) || []
          let typeType: string = null
          if (types.length) {
            typeType = `${specialistCellTypes.find(sct => sct.key === types[0])?.attributes?.affectsCapacity ? 'SPECIAL' : 'NORMAL'}_ACCOMMODATION`
          }

          callback(err, {
            [accommodationTypeKey]: typeType,
            ...values,
          })
        })
      }
    }
  }

  if (path === '/set-cell-type/normal' || path === '/set-cell-type/special') {
    return class extends step.controller {
      getInitialValues(req: FormWizard.Request, _res: Response): FormWizard.Values {
        if (req.sessionModel.get<boolean>(`temp-cellTypes-removed`)) {
          return {}
        }

        const types =
          req.sessionModel.get<string[]>(`temp-cellTypes`) || req.sessionModel.get<string[]>(`saved-cellTypes`) || []

        return {
          [`set-cell-type_normalCellTypes`]: types,
          [`set-cell-type_specialistCellTypes`]: types,
        }
      }

      override saveValues(req: FormWizard.Request, _res: Response, next: NextFunction) {
        const [, cellTypes] = Object.entries(req.body).find(([key]) => key.endsWith(`CellTypes`))
        const cellTypesFlat = [cellTypes].flat()

        req.sessionModel.set(`temp-cellTypes`, cellTypesFlat)
        req.sessionModel.unset(`temp-cellTypes-removed`)
        req.sessionModel.unset('errorValues')
        next()
      }
    }
  }

  return step.controller
}

// Wrap the setCellType steps controller with another controller that appends the field names with cellId
const setCellTypeSteps = Object.fromEntries(
  Object.entries(
    SetCellType.getSteps({
      next: 'capacity',
    }),
  ).map(([k, step]) => [
    k,
    {
      ...step,
      controller: wrapSetCellTypeController(k, step),
      editable: true,
    },
  ]),
)

const steps: FormWizard.Steps = {
  '/': {
    backLink: (req, res) => {
      const { id, prisonId } = res.locals.decoratedLocation

      return req.isEditing ? `/location/${id}/cell-conversion/confirm` : `/view-and-update-locations/${prisonId}/${id}`
    },
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'cert-change-disclaimer',
      },
      'accommodation-type',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'accommodation-type',
    title: (_req, _res) => `Cell conversion`,
    caption: (_req, res) => capFirst(res.locals.decoratedLocation.displayName),
  }),
  '/accommodation-type': {
    controller: CellConversionAccommodationType,
    editable: true,
    fields: ['accommodationType'],
    next: [
      { field: 'accommodationType', value: 'NORMAL_ACCOMMODATION', next: 'used-for' },
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'door-number',
      },
      'specific-cell-type',
    ],
  },
  '/used-for': {
    editable: true,
    controller: CellConversionUsedFor,
    fields: ['usedForTypes'],
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'door-number',
      },
      'specific-cell-type',
    ],
  },
  '/specific-cell-type': {
    editable: true,
    controller: CellConversionSpecificCellType,
    fields: ['hasSpecificCellType'],
    next: [{ field: 'hasSpecificCellType', value: 'yes', next: 'set-cell-type' }, 'set-cell-capacity'],
  },
  '/set-cell-type': {
    editable: true,
    fields: ['specialistCellTypes'],
    controller: CellConversionSetCellType,
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'door-number',
      },
      'set-cell-capacity',
    ],
  },
  '/set-cell-capacity': {
    editable: true,
    fields: ['workingCapacity', 'maxCapacity'],
    controller: CellConversionSetCellCapacity,
    next: 'confirm',
  },
  '/confirm': {
    controller: CellConversionConfirm,
  },
  '/door-number': {
    fields: ['doorNumber'],
    next: 'capacity',
    controller: CellConversionDoorNumber,
    pageTitle: 'Convert to cell',
  },
  '/capacity': {
    fields: ['CERT_baselineCna', 'CERT_workingCapacity', 'CERT_maximumCapacity'],
    next: 'sanitation',
    controller: CellConversionCapacity,
    pageTitle: 'Convert to cell',
  },
  ...setCellTypeSteps,
  '/remove-cell-type': {
    entryPoint: true,
    skip: true,
    controller: RemoveCellType,
    next: '#', // redirect handled in controller
    editable: true,
    continueOnEdit: true,
  },
  '/sanitation': {
    fields: ['inCellSanitation'],
    controller: FormInitialStep,
    pageTitle: 'Convert to cell',
    next: 'submit-certification-approval-request',
  },
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
