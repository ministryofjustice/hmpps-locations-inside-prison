// eslint-disable-next-line max-classes-per-file
import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import BaseController from './baseController'
import CellNumbers from './cellNumbers'
import CellDoorNumbers from './cellDoorNumbers'
import SetCellType from '../setCellType'
import Capacities from './capacities'
import modifyFieldName from '../../helpers/field/modifyFieldName'
import WithoutSanitation from './withoutSanitation'
import UsedFor from './usedFor'
import RemoveCellType from './removeCellType'

function wrapSetCellTypeController(path: string, step: FormWizard.Step) {
  if (path === '/set-cell-type/:cellId') {
    return class WrappedSetCellTypeController extends step.controller {
      override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
        const pathPrefix = req.form.options.fullPath.replace(/\/set-cell-type\/.*/, '')
        const history = req.journeyModel.get('history') as FormWizard.HistoryStep[]

        this.addJourneyHistoryStep(req, res, {
          path: history.find(item => {
            return item.next.endsWith('/capacities')
          }).next,
          next: `${pathPrefix}/set-cell-type/:cellId/type`,
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
      this.use(this.appendCellIdToFields)
    }

    appendCellIdToFields(req: FormWizard.Request, _res: Response, next: NextFunction) {
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

  if (path === '/set-cell-type/:cellId/type') {
    controller = class extends controller {
      override async getValues(
        req: FormWizard.Request,
        res: Response,
        callback: (err: Error, values?: FormWizard.Values) => void,
      ) {
        const specialistCellTypesObject = await req.services.locationsService.getSpecialistCellTypes(
          req.session.systemToken,
        )

        return super.getValues(req, res, (err: Error, values?: FormWizard.Values) => {
          const { cellId } = req.params
          const accommodationTypeKey = Object.keys(req.form.options.fields).find(f => f.includes('accommodationType'))

          const types =
            req.sessionModel.get<string[]>(`temp-cellTypes${cellId}`) ||
            req.sessionModel.get<string[]>(`saved-cellTypes${cellId}`) ||
            []
          let typeType: string = null
          if (types.length) {
            typeType = `${specialistCellTypesObject.find(sct => sct.key === types[0])?.attributes?.affectsCapacity ? 'SPECIAL' : 'NORMAL'}_ACCOMMODATION`
          }

          callback(err, {
            [accommodationTypeKey]: typeType,
            ...values,
          })
        })
      }
    }
  }

  if (path === '/set-cell-type/:cellId/normal' || path === '/set-cell-type/:cellId/special') {
    controller = class extends controller {
      override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
        const { cellId } = req.params
        const [, cellTypes] = Object.entries(req.body).find(([key]) => key.endsWith(`CellTypes${cellId}`))
        const cellTypesFlat = [cellTypes].flat()

        req.sessionModel.set(`temp-cellTypes${cellId}`, cellTypesFlat)
        req.sessionModel.unset('errorValues')
        next()
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
    editable: true,
    pageTitle: 'Enter cell details',
    fields: ['cellsToCreate', 'accommodationType'],
    controller: BaseController,
    next: 'cell-numbers',
  },
  '/cell-numbers': {
    pageTitle: 'Enter cell numbers',
    template: '../../commonTransactions/createCells/cellNumbers',
    controller: CellNumbers,
    next: 'door-numbers',
    editable: true,
  },
  '/door-numbers': {
    pageTitle: 'Enter cell door numbers',
    controller: CellDoorNumbers,
    template: '../../commonTransactions/createCells/doorNumbers',
    next: 'capacities',
    editable: true,
  },
  '/capacities': {
    pageTitle: 'Enter cell capacities and type',
    controller: Capacities,
    template: '../../commonTransactions/createCells/capacities',
    fields: ['baselineCna', 'workingCapacity', 'maximumCapacity'],
    next: [
      { field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'used-for' },
      'bulk-sanitation',
    ],
    editable: true,
  },
  ...setCellTypeSteps,
  '/remove-cell-type/:cellId': {
    entryPoint: true,
    skip: true,
    controller: RemoveCellType,
    next: 'capacities',
    editable: true,
    continueOnEdit: true,
  },
  '/used-for': {
    pageTitle: 'What are the cells used for?',
    controller: UsedFor,
    fields: ['usedFor'],
    next: 'bulk-sanitation',
    editable: true,
  },
  '/bulk-sanitation': {
    pageTitle: 'Do all cells have in-cell sanitation?',
    controller: BaseController,
    fields: ['bulkSanitation'],
    next: [
      { field: 'bulkSanitation', op: '==', value: 'NO', next: 'without-sanitation', continueOnEdit: true },
      '$END_OF_TRANSACTION$',
    ],
    editable: true,
  },
  '/without-sanitation': {
    pageTitle: 'Select any cells without in-cell sanitation',
    controller: WithoutSanitation,
    fields: ['withoutSanitation'],
    editable: true,
  },
}

export default steps
