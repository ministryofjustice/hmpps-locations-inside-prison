import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Structure from './structure'
import fields from '../../routes/createLocation/fields'
import AnalyticsService from '../../services/analyticsService'

describe('Create location structure', () => {
  const controller = new Structure({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let sessionModelData: { [key: string]: any }

  beforeEach(() => {
    sessionModelData = {
      locationType: 'WING',
    }
    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
        },
        values: {},
      },
      services: {
        analyticsService,
      },
      sessionModel: {
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        get: (key: string) => sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
        unset: (key: string) => delete sessionModelData[key],
      },
      journeyModel: {
        reset: jest.fn(),
      },
      body: {},
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {},
      },
      redirect: jest.fn(),
    }

    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals with structure defaults', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual(
        expect.objectContaining({
          level2: 'Landings',
          level3: 'Cells',
          level4: '',
          backLink: '/create-new/TST/details',
          cancelLink: '/view-and-update-locations/TST',
        }),
      )
    })

    it('returns correct levels from form values', () => {
      deepReq.form.values = {
        ...deepReq.form.values,
        'level-2': 'Landings',
        'level-3': 'Spurs',
        'level-4': 'Cells',
      }

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.level2).toBe('Landings')
      expect(result.level3).toBe('Spurs')
      expect(result.level4).toBe('Cells')
    })
  })

  describe('validateFields', () => {
    it('sets structure levels correctly in sessionModel and values', async () => {
      deepReq.body = {
        'level-2': 'Landings',
        'level-3': 'Spurs',
        'level-4': 'Cells',
      }

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(sessionModelData).toEqual({
        'level-2': 'LANDING',
        'level-3': 'SPUR',
        'level-4': 'CELL',
        locationType: 'WING',
        structureLevels: ['LANDING', 'SPUR', 'CELL'],
      })
      expect(deepReq.form.values['level-2']).toBe('LANDING')
      expect(deepReq.form.values['level-3']).toBe('SPUR')
      expect(deepReq.form.values['level-4']).toBe('CELL')
      expect(callback).toHaveBeenCalled()
    })

    it('returns an error if structure levels contain duplicates', async () => {
      deepReq.body = {
        'level-2': 'Landings',
        'level-3': 'Landings',
      }

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          levelType: controller.formError('levelType', 'createLevelDuplicate'),
        }),
      )
    })

    it('returns an error if "Cells" is not the last item', async () => {
      deepReq.body = {
        'level-2': 'Cells',
        'level-3': 'Landings',
      }

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          levelType: controller.formError('levelType', 'createLevelHierarchy', 3),
        }),
      )
    })

    it('does NOT return an error if Cells is last and no duplicates', async () => {
      deepReq.body = {
        'level-2': 'Landings',
        'level-3': 'Spurs',
        'level-4': 'Cells',
      }

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalled()
    })
  })
})
