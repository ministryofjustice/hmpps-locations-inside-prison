import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import NonResidentialConversionDetails from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/nonResidentialConversion/fields'
import maxLength from '../../validators/maxLength'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('NonResidentialConversionDetails', () => {
  const controller = new NonResidentialConversionDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          convertedCellType: 'OTHER',
          otherConvertedCellType: 'pet therapy room',
        },
      },
      services: {
        locationsService,
      },
      session: { systemToken: 'token' },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: 'TREATMENT_ROOM',
              otherConvertedCellType: 'pet therapy room',
            })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
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
        prisonConfiguration: {
          prisonId: 'TST',
          resiLocationServiceActive: 'ACTIVE',
          includeSegregationInRollCount: 'INACTIVE',
          certificationApprovalRequired: 'ACTIVE',
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: 'TREATMENT_ROOM',
          otherConvertedCellType: 'pet therapy room',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getConvertedCellTypes = jest.fn().mockResolvedValue([
      {
        key: 'KITCHEN_SERVERY',
        description: 'Kitchen / Servery',
      },
      {
        key: 'OFFICE',
        description: 'Office',
      },
      {
        key: 'OTHER',
        description: 'Other',
      },
    ])
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the correct radio items', () => {
      expect(deepReq.form.options.fields.convertedCellType.items).toEqual([
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY' },
        { text: 'Office', value: 'OFFICE' },
        {
          text: 'Other',
          value: 'OTHER',
          conditional: 'otherConvertedCellType',
        },
      ])
    })

    it('calls next', () => {
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          convertedCellType: {
            component: 'govukRadios',
            errorMessages: {
              required: 'Select a non-residential room type',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'What is the room being used for?',
              },
            },
            id: 'convertedCellType',
            items: [
              {
                text: 'Kitchen / Servery',
                value: 'KITCHEN_SERVERY',
              },
              {
                text: 'Office',
                value: 'OFFICE',
              },
              {
                conditional: 'otherConvertedCellType',
                text: 'Other',
                value: 'OTHER',
              },
            ],
            name: 'convertedCellType',
            validate: ['required'],
            value: 'TREATMENT_ROOM',
          },
          otherConvertedCellType: {
            autocomplete: 'off',
            component: 'govukInput',
            id: 'otherConvertedCellType',
            label: {
              text: 'Room description',
            },
            name: 'otherConvertedCellType',
            validate: ['required', maxLength(30)],
            value: 'pet therapy room',
          },
          'submit-certification-approval-request_confirmation': {
            component: 'govukCheckboxes',
            errorMessages: {
              required: 'Confirm that changes have been agreed',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'Confirm changes have been agreed',
              },
            },
            hint: {
              text: 'By submitting this request, you confirm that this change has been agreed by the PGD.',
            },
            id: 'submit-certification-approval-request_confirmation',
            items: [
              {
                text: 'I understand and agree with the above statement.',
                value: 'yes',
              },
            ],
            label: {
              text: 'Confirm changes have been agreed',
            },
            multiple: false,
            name: 'submit-certification-approval-request_confirmation',
            validate: ['required'],
            value: undefined,
          },
          'update-signed-op-cap_currentSignedOpCap': {
            autocomplete: 'off',
            component: 'govukInput',
            hideWhenRemoved: false,
            id: 'update-signed-op-cap_currentSignedOpCap',
            label: {
              classes: 'govuk-label--m',
              for: 'update-signed-op-cap_currentSignedOpCap',
              text: 'Current signed operational capacity',
            },
            name: 'update-signed-op-cap_currentSignedOpCap',
            remove: expect.any(Function),
            value: undefined,
          },
          'update-signed-op-cap_explanation': {
            autocomplete: 'off',
            component: 'govukTextarea',
            errorMessages: {
              required: 'Explain why you need to update the signed operational capacity',
            },
            hint: {
              text: 'This will help the authorising director understand the need for the change to capacity.',
            },
            id: 'update-signed-op-cap_explanation',
            'ignore-defaults': true,
            label: {
              classes: 'govuk-label--m',
              for: 'update-signed-op-cap_explanation',
              text: 'Explain why you need to update the signed operational capacity',
            },
            name: 'update-signed-op-cap_explanation',
            rows: 5,
            validate: ['required'],
            value: undefined,
          },
          'update-signed-op-cap_isUpdateNeeded': {
            autocomplete: 'off',
            component: 'govukRadios',
            errorMessages: {
              required: 'Select if you need to update the operational capacity',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'Do you need to update the operational capacity as part of this change?',
              },
            },
            id: 'update-signed-op-cap_isUpdateNeeded',
            items: [
              {
                text: 'Yes, I need to update it',
                value: 'YES',
              },
              {
                text: 'No',
                value: 'NO',
              },
            ],
            name: 'update-signed-op-cap_isUpdateNeeded',
            validate: ['required'],
            value: undefined,
          },
          'update-signed-op-cap_newSignedOpCap': {
            autocomplete: 'off',
            classes: 'govuk-input--width-3',
            component: 'govukInput',
            errorMessages: {
              notEqual: 'Enter a different signed operational capacity',
            },
            id: 'update-signed-op-cap_newSignedOpCap',
            label: {
              classes: 'govuk-label--m',
              for: 'update-signed-op-cap_newSignedOpCap',
              text: 'New signed operational capacity',
            },
            name: 'update-signed-op-cap_newSignedOpCap',
            validate: [
              'required',
              'numeric',
              {
                arguments: [
                  {
                    field: 'update-signed-op-cap_currentSignedOpCap',
                  },
                ],
                fn: expect.any(Function),
              },
            ],
            value: undefined,
          },
          explanation: {
            remove: expect.any(Function),
            hideWhenRemoved: true,
            validate: ['required'],
            component: 'govukTextarea',
            errorMessages: {
              required: 'Enter a reason for this change',
            },
            id: 'explanation',
            name: 'explanation',
            rows: 5,
            label: {
              text: 'Explain the reason for this change',
              classes: 'govuk-label--m',
              for: 'explanation',
            },
            hint: {
              text: 'This will help the authorising director understand the need for the change.',
            },
            autocomplete: 'off',
            'ignore-defaults': true,
          },
        },
        title: 'Convert cell to non-residential room',
        titleCaption: 'A-1-001',
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.options.fields.convertedCellType.items = [
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY' },
        { text: 'Office', value: 'OFFICE' },
        {
          conditional: 'otherConvertedCellType',
          text: 'Other',
          value: 'OTHER',
        },
      ]
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the session model correctly', () => {
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('convertedCellType', 'OTHER')
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('otherConvertedCellType', 'pet therapy room')
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
