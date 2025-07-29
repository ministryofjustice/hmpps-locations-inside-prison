import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import pluralize from '../../formatters/pluralize'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class Structure extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { values } = req.form

    locals.locationType = req.sessionModel.get<string>('locationType')

    const isFirstLoad = !values['level-2'] && !values['level-3']

    if (values['level-2']) {
      locals.level2 = pluralize(String(values['level-2']))
    } else if (isFirstLoad) {
      locals.level2 = 'Landings'
    } else {
      locals.level2 = ''
    }

    if (values['level-3']) {
      locals.level3 = pluralize(String(values['level-3']))
    } else if (isFirstLoad) {
      locals.level3 = 'Cells'
    } else {
      locals.level3 = ''
    }

    locals.level4 = values['level-4'] ? pluralize(String(values['level-4'])) : ''

    return locals
  }

  async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { body } = req
      const validationErrors: FormWizard.Errors = {}
      const structureIndexStart = 2
      const structureMaxLevels = 3

      // clear structure if it was previously set
      for (let i = structureIndexStart; i < structureIndexStart + structureMaxLevels; i += 1) {
        delete req.form.values[`level-${i}`]
        req.sessionModel.unset(`level-${i}`)
      }
      delete req.form.values.structureLevels
      req.sessionModel.unset('structureLevels')

      // set structureLevels
      const toUpper = (string: string) => string.toUpperCase()

      const pluralToSingularMap: Record<string, string> = {
        LANDINGS: 'LANDING',
        CELLS: 'CELL',
        SPURS: 'SPUR',
      }

      const structureLevels: string[] = []
      structureLevels.push(pluralToSingularMap[toUpper(body['level-2'] || 'LANDING')] || '')

      if (body['level-3']) {
        structureLevels.push(pluralToSingularMap[toUpper(body['level-3'])] || '')
      }
      if (body['level-4']) {
        structureLevels.push(pluralToSingularMap[toUpper(body['level-4'])] || '')
      }

      // persist levels for re-rendering if there are validation errors
      req.form.values.structureLevels = structureLevels

      structureLevels.forEach((level, index) => {
        const levelKey = `level-${index + structureIndexStart}`
        req.form.values[levelKey] = level
        req.sessionModel.set(levelKey, level)
      })
      req.sessionModel.set('structureLevels', structureLevels)

      // validation
      const hasDuplicates = new Set(structureLevels).size !== structureLevels.length
      if (hasDuplicates) {
        validationErrors.levelType = this.formError('levelType', 'createLevelDuplicate')
        return callback({ ...errors, ...validationErrors })
      }

      const lastIndex = structureLevels.length - 1
      if (structureLevels[lastIndex] !== 'CELL') {
        const errorLevelNumber = structureIndexStart + lastIndex
        validationErrors.levelType = this.formError('levelType', 'createLevelHierarchy', errorLevelNumber)
        return callback({ ...errors, ...validationErrors })
      }

      return callback({ ...errors, ...validationErrors })
    })
  }
}
