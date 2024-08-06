import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import CheckRemoveCellType from './check'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/removeCellType/fields'

describe('CheckRemoveCellType', () => {
  const controller = new CheckRemoveCellType({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      // @ts-ignore
      form: {
        options: {
          // @ts-ignore
          fields,
        },
        values: {
          areYouSure: 'yes',
        },
      },
    }
    res = {
      locals: {
        errorlist: [],
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'MDI',
        }),
        options: {
          // @ts-ignore
          fields,
        },
        // @ts-ignore
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
      res.locals.errorlist = [
        {
          key: 'areYouSure',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
    })

    it('returns the expected locals for a single cell type', () => {
      res.locals.location.specialistCellTypes = ['Accessible cell']
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cellTypesLabel: 'Cell type:',
        cellTypesText: 'Accessible cell',
        fields,
        pageTitleText: 'Are you sure you want to remove the specific cell type?',
        validationErrors: [
          {
            text: 'Select yes if you want to remove the specific cell type',
            href: '#areYouSure',
          },
        ],
      })
    })

    it('returns the expected locals for multiple cell types', () => {
      res.locals.location.specialistCellTypes = ['Dry cell', 'Escape list cell']
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cellTypesLabel: 'Cell types:',
        cellTypesText: 'Dry cell, Escape list cell',
        fields,
        pageTitleText: 'Are you sure you want to remove all of the specific cell types?',
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
      req.form.values = { areYouSure: 'no' }
      res.redirect = jest.fn()
      controller.validate(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })

    it('calls next when yes is selected', () => {
      req.form.values = { areYouSure: 'yes' }
      controller.validate(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
