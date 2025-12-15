import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import LocationsService from '../../services/locationsService'
import Details from './details'

describe('Details', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let sessionModelData: Record<string, any>
  let locationsService: jest.Mocked<LocationsService>

  beforeEach(() => {
    sessionModelData = {
      blah_cellsToCreate: '2',
      blah_accommodationType: 'NORMAL_ACCOMMODATION',
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
        unset: jest.fn((key: string) => delete sessionModelData[key]),
        reset: () => {
          sessionModelData = {}
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      body: {},
      isEditing: true,
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

  describe('saveValues', () => {
    describe('when not editing', () => {
      beforeEach(() => {
        deepReq.isEditing = false
      })

      describe('when accommodationType is not NORMAL_ACCOMMODATION', () => {
        it('unsets usedFor', () => {
          deepReq.body = {
            blah_cellsToCreate: '3',
            blah_accommodationType: 'ANYTHING_ELSE',
          }
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, () => {})
          expect(deepReq.sessionModel.unset).toHaveBeenCalledWith('blah_usedFor')
        })
      })
    })

    describe('when editing', () => {
      describe('when accommodationType is not NORMAL_ACCOMMODATION', () => {
        it('unsets usedFor', () => {
          deepReq.body = {
            blah_cellsToCreate: '3',
            blah_accommodationType: 'ANYTHING_ELSE',
          }
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, () => {})
          expect(deepReq.sessionModel.unset).toHaveBeenCalledWith('blah_usedFor')
        })
      })

      it('sets editing to false if any value is changed', () => {
        deepReq.body = {
          blah_cellsToCreate: '3',
          blah_accommodationType: sessionModelData.blah_accommodationType,
        }
        controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, () => {})
        expect(deepReq.isEditing).toEqual(false)

        deepReq.isEditing = true
        deepReq.body = {
          blah_cellsToCreate: sessionModelData.blah_cellsToCreate,
          blah_accommodationType: 'OTHER',
        }
        controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, () => {})
        expect(deepReq.isEditing).toEqual(false)
      })

      it('does not set editing to false if the values are the same', () => {
        deepReq.body = sessionModelData
        controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, () => {})
        expect(deepReq.isEditing).toEqual(true)
      })
    })
  })
})
