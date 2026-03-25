// eslint-disable-next-line max-classes-per-file
import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import ReactivateLocationInit from '../../../controllers/reactivate/location/init'
import CertChangeDisclaimer from '../../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../../formatters/capFirst'
import CheckCapacity from '../../../controllers/reactivate/location/checkCapacity'
import EditCapacity from '../../../controllers/reactivate/location/editCapacity'
import SetCellType from '../../../commonTransactions/setCellType'
import modifyFieldName from '../../../helpers/field/modifyFieldName'
import populateLocation from '../../../middleware/populateLocation'
import RemoveCellType from '../../../controllers/reactivate/location/removeCellType'

function wrapSetCellTypeController(path: string, step: FormWizard.Step) {
  if (path === '/:cellId/set-cell-type/init') {
    return class WrappedSetCellTypeController extends step.controller {
      override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
        const pathPrefix = req.form.options.fullPath.replace(/\/set-cell-type\/.*/, '')
        const history = req.journeyModel.get('history') as FormWizard.HistoryStep[]

        this.addJourneyHistoryStep(req, res, {
          path: history.find(item => {
            return item.next.includes('/edit-capacity/')
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

  let controller = class extends step.controller {
    override middlewareSetup() {
      super.middlewareSetup()
      this.use(this.populateCell)
      this.use(this.appendCellIdToFields)
    }

    private async populateCell(req: FormWizard.Request, res: Response, next: NextFunction) {
      await populateLocation({ id: req.params.cellId, localName: 'cell' })(req, res, next)
    }

    getCellPath(_req: FormWizard.Request, res: Response) {
      return res.locals.cell.pathHierarchy
    }

    private appendCellIdToFields(req: FormWizard.Request, _res: Response, next: NextFunction) {
      const { options } = req.form
      const { cellId } = req.params

      if (options.fields) {
        options.fields = Object.fromEntries(
          Object.entries(options.fields).map(([id, field]) => [
            `${id}${cellId}`,
            modifyFieldName(field, o => `${o}${cellId}`),
          ]),
        )
      }
      if (Array.isArray(options.next)) {
        options.next = options.next.map(o => {
          if (typeof o === 'string') return o
          if ('field' in o) {
            return { ...o, field: `${o.field}${cellId}` }
          }
          return o
        })
      }
      next()
    }
  }

  if (path === '/:cellId/set-cell-type/type') {
    controller = class extends controller {
      override async getValues(
        req: FormWizard.Request,
        res: Response,
        callback: (err: Error, values?: FormWizard.Values) => void,
      ) {
        const { cellId } = req.params
        if (req.sessionModel.get<boolean>(`temp-cellTypes${cellId}-removed`)) {
          return super.getValues(req, res, callback)
        }

        const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

        return super.getValues(req, res, (err: Error, values?: FormWizard.Values) => {
          const accommodationTypeKey = Object.keys(req.form.options.fields).find(f => f.includes('accommodationType'))

          const types =
            req.sessionModel.get<string[]>(`temp-cellTypes${cellId}`) ||
            req.sessionModel.get<string[]>(`saved-cellTypes${cellId}`) ||
            []
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

  if (path === '/:cellId/set-cell-type/normal' || path === '/:cellId/set-cell-type/special') {
    controller = class extends controller {
      getInitialValues(req: FormWizard.Request, _res: Response): FormWizard.Values {
        const { cellId } = req.params
        if (req.sessionModel.get<boolean>(`temp-cellTypes${cellId}-removed`)) {
          return {}
        }

        const types =
          req.sessionModel.get<string[]>(`temp-cellTypes${cellId}`) ||
          req.sessionModel.get<string[]>(`saved-cellTypes${cellId}`) ||
          []

        return {
          [`set-cell-type_normalCellTypes${cellId}`]: types,
          [`set-cell-type_specialistCellTypes${cellId}`]: types,
        }
      }

      override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
        const { cellId } = req.params
        const [, cellTypes] = Object.entries(req.body).find(([key]) => key.endsWith(`CellTypes${cellId}`))
        const cellTypesFlat = [cellTypes].flat()

        req.sessionModel.set(`temp-cellTypes${cellId}`, cellTypesFlat)
        req.sessionModel.unset(`temp-cellTypes${cellId}-removed`)
        req.sessionModel.unset('errorValues')

        const { parentId } = res.locals.cell
        res.redirect(
          `/reactivate/location/${res.locals.decoratedLocation.id}/edit-capacity/${res.locals.decoratedLocation.id === cellId ? cellId : parentId}`,
        )
      }
    }
  }

  return controller
}

// Wrap the setCellType steps controller with another controller that appends the field names with cellId
const setCellTypeSteps = Object.fromEntries(
  Object.entries(
    SetCellType.getSteps({
      next: 'capacities',
      prefix: ':cellId',
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
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) => {
      const { prisonId, id } = res.locals.decoratedLocation

      return `/view-and-update-locations/${prisonId}/${id}`
    },
    next: 'cert-change-disclaimer',
    controller: ReactivateLocationInit,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'check-capacity',
    title: (_req, res) => `${res.locals.decoratedLocation.locationType} activation`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)}`,
  }),
  '/check-capacity': {
    next: 'update-signed-op-cap',
    controller: CheckCapacity,
  },
  '/edit-capacity/:parentLocationId': {
    template: 'edit-capacity',
    next: 'check-capacity',
    controller: EditCapacity,
    fields: ['baselineCna', 'workingCapacity', 'maximumCapacity'],
  },
  ...setCellTypeSteps,
  '/:cellId/remove-cell-type': {
    entryPoint: true,
    skip: true,
    controller: RemoveCellType,
    next: '#', // redirect handled in controller
    editable: true,
    continueOnEdit: true,
  },
}

export default steps
