import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import CheckRemoveCellType from './check'
import fields from '../../routes/removeCellType/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CheckRemoveCellType', () => {
  const controller = new CheckRemoveCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          areYouSure: 'yes',
        },
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'MDI',
        }),
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          areYouSure: 'yes',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
  })

  describe('locals', () => {
    beforeEach(() => {
      deepRes.locals.errorlist = [
        {
          key: 'areYouSure',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
    })

    it('returns the expected locals for a single cell type', () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = ['Accessible cell']
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        cellTypesLabel: 'Cell type:',
        cellTypesText: 'Accessible cell',
        fields,
        title: 'Are you sure you want to remove the specific cell type?',
        titleCaption: 'Cell A-1-001',
        validationErrors: [
          {
            text: 'Select yes if you want to remove the specific cell type',
            href: '#areYouSure',
          },
        ],
      })
    })

    it('returns the expected locals for multiple cell types', () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = ['Dry cell', 'Escape list cell']
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        cellTypesLabel: 'Cell types:',
        cellTypesText: 'Dry cell, Escape list cell',
        fields,
        title: 'Are you sure you want to remove all of the specific cell types?',
        titleCaption: 'Cell A-1-001',
        validationErrors: [
          {
            text: 'Select yes if you want to remove the specific cell types',
            href: '#areYouSure',
          },
        ],
      })
    })
  })

  describe('validate', () => {
    it('redirects to the show location page when no is selected', () => {
      deepReq.form.values = { areYouSure: 'no' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })

    it('calls next when yes is selected', () => {
      deepReq.form.values = { areYouSure: 'yes' }
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
