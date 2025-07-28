import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import CellDetails from './cellDetails'
import LocationsService from '../../services/locationsService'

describe('CellDetails', () => {
  const controller = new CellDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let sessionModelData: Record<string, any>
  let locationsService: jest.Mocked<LocationsService>

  beforeEach(() => {
    sessionModelData = {
      locationType: 'LANDING',
      locationCode: 'W',
      localName: 'WEST',
    }

    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {},
        values: {},
      },
      services: {
        locationsService,
      },
      sessionModel: {
        get: (key: string) => sessionModelData[key],
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        unset: (key: string) => delete sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      body: {},
    }

    deepRes = {
      locals: {
        locationId: 'uuid-123',
        prisonId: 'TST',
        decoratedResidentialSummary: {
          location: {
            pathHierarchy: 'L',
          },
        },
        options: {},
        user: {
          username: 'JTIMPSON',
        },
        errorlist: [],
      },
      redirect: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals, with a localName set', () => {
      sessionModelData.localName = 'WEST'
      sessionModelData.locationType = 'LANDING'

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toMatchObject({
        locationType: 'LANDING',
        titleCaption: 'Create cells on landing WEST',
        backLink: '/create-new/uuid-123/details',
        cancelLink: '/view-and-update-locations/TST/uuid-123',
      })
    })

    it('falls back to locationCode and pathHierarchy when localName is blank', () => {
      sessionModelData.localName = ''
      sessionModelData.locationCode = '1'
      sessionModelData.locationType = 'LANDING'

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.titleCaption).toBe('Create cells on landing L-1')
    })
  })
})
