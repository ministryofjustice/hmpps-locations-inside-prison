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
            pathHierarchy: 'LandingName',
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
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.locationType).toBe('LANDING')
      expect(result.pageTitleText).toBe('LandingName-WEST')
      expect(result.backLink).toBe('/create-new/uuid-123/details')
      expect(result.cancelLink).toBe('/view-and-update-locations/TST/uuid-123')
    })

    it('text falls back to locationCode if localName is blank', () => {
      sessionModelData.localName = ''
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.pageTitleText).toBe('LandingName-W')
    })
  })
})
