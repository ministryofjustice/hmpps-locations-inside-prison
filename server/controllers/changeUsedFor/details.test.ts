import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeUsedForDetails from './details'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/changeUsedFor/fields'

describe('ChangeUsedForDetails', () => {
  const controller = new ChangeUsedForDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
      },
      form: {
        options: {
          fields,
        },
        values: {
          usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
        },
      },
      services: {
        authService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              usedFor: [{ text: 'Remand', value: 'REMAND' }],
            })[fieldName],
        ),
      },
    } as unknown as typeof req
    res = {
      locals: {
        errorlist: [],
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          localName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          usedFor: [
            {
              value: 'REMAND',
              text: 'Remand',
            },
          ],
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getUsedForTypes = jest.fn().mockResolvedValue([
      { key: 'REMAND', description: 'Remand' },
      { key: 'THERAPEUTIC_COMMUNITY', description: 'Therapeutic community' },
    ])
    locationsService.updateUsedForTypes = jest.fn().mockResolvedValue(true)
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(req, res, next)
    })

    it('sets the correct checkbox items', () => {
      expect(req.form.options.fields.usedFor.items).toEqual([
        {
          value: 'REMAND',
          text: 'Remand',
        },
        {
          value: 'THERAPEUTIC_COMMUNITY',
          text: 'Therapeutic community',
        },
      ])
    })

    it('calls next', () => {
      controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      controller.setOptions(req, res, jest.fn())

      expect(controller.locals(req, res)).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          usedFor: {
            component: 'govukCheckboxes',
            errorMessages: {
              required: 'Select what the location is used for',
            },
            hint: { text: 'Select all that apply' },
            id: 'usedFor',
            items: [
              {
                value: 'REMAND',
                text: 'Remand',
              },
              {
                value: 'THERAPEUTIC_COMMUNITY',
                text: 'Therapeutic community',
              },
            ],
            multiple: true,
            name: 'usedFor',
            validate: ['required'],
            value: [
              {
                text: 'Remand',
                value: 'REMAND',
              },
            ],
          },
        },
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      req.form.options.fields.usedFor.items = [
        {
          value: 'REMAND',
          text: 'Remand',
        },
      ]
      controller.saveValues(req, res, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateUsedForTypes).toHaveBeenCalledWith(
        'token',
        res.locals.location.id,
        req.form.values.usedFor,
      )
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
