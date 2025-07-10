import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import { capitalize } from 'lodash'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'

export default class Structure extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals
    const { locationType } = res.locals.decoratedLocation
    const { values } = req.form

    const formatLevelValue = (value: string) => {
      if (!value) return ''
      return capitalize(value)
    }

    const level2 = formatLevelValue(String(values['level-2'] || 'Landings'))
    const level3 = formatLevelValue(String(values['level-3'] || ''))
    const level4 = formatLevelValue(String(values['level-4'] || ''))

    const backLink = backUrl(req, {
      fallbackUrl: `/manage-locations/${prisonId}/create-new-${locationType.toLowerCase()}/details`,
    })

    return {
      ...locals,
      level2,
      level3,
      level4,
      backLink,
      cancelLink: `/manage-locations/${prisonId}`,
    }
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

      const structureLevels: string[] = []
      structureLevels.push(toUpper(body['level-2'] || 'LANDINGS'))

      if (body['level-3']) {
        structureLevels.push(toUpper(body['level-3']))
      }
      if (body['level-4']) {
        structureLevels.push(toUpper(body['level-4']))
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
      }

      const lastSelected = structureLevels[structureLevels.length - 1]
      const hasCells = structureLevels.includes('CELLS')
      const cellIsNotLast = hasCells && lastSelected !== 'CELLS'

      if (cellIsNotLast) {
        validationErrors.levelType = this.formError('levelType', 'createLevelHierarchy')
      }

      return callback({ ...errors, ...validationErrors })
    })
  }
}
