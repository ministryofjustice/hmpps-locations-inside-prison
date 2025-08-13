import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import BaseController from './baseController'
import CellNumbers from './cellNumbers'
import CellDoorNumbers from './cellDoorNumbers'
import SetCellType from '../setCellType'
import Capacities from './capacities'
import modifyFieldName from '../../helpers/field/modifyFieldName'

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
      controller: class extends step.controller {
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

          next()
        }
      },
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
  },
  '/door-numbers': {
    pageTitle: 'Enter cell door numbers',
    controller: CellDoorNumbers,
    template: '../../commonTransactions/createCells/doorNumbers',
    next: 'capacities',
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
  },
  ...setCellTypeSteps,
  '/used-for': {
    pageTitle: 'What are the cells used for?',
    controller: BaseController,
    template: '../../commonTransactions/createCells/usedFor',
    next: 'bulk-sanitation',
  },
  '/bulk-sanitation': {
    pageTitle: 'Do all cells have in-cell sanitation?',
    controller: BaseController,
    template: '../../commonTransactions/createCells/bulkSanitation',
    next: [{ field: 'bulkSanitation', op: '==', value: 'no', next: 'without-sanitation' }, '$END_OF_TRANSACTION$'],
  },
  '/without-sanitation': {
    pageTitle: 'Select any cells without in-cell sanitation',
    controller: BaseController,
    template: '../../commonTransactions/createCells/withoutSanitation',
  },
}

export default steps
