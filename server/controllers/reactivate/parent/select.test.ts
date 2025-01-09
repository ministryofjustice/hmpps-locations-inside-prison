import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ReactivateParentSelect from './select'
import fields from '../../../routes/reactivate/parent/fields'

describe('ReactivateParentSelect', () => {
  const controller = new ReactivateParentSelect({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let sessionModelValues: {
    referrerPrisonId: string
    referrerLocationId: string
    selectedLocations: string[]
  }

  beforeEach(() => {
    sessionModelValues = {
      referrerPrisonId: 'TST',
      referrerLocationId: 'l0',
      selectedLocations: ['l1', 'l2'],
    }
    req = {
      form: {
        options: {
          fields,
        },
        values: sessionModelValues,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn((fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        },
        cells: [
          {
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          },
        ],
        options: {
          fields,
        },
        prisonerLocation: {
          prisoners: [],
        },
        locationResidentialSummary: {
          subLocationName: 'Wing',
          subLocations: [
            { id: 'id1', localName: 'Name 1' },
            { id: 'id2', pathHierarchy: 'A-2' },
            { id: 'id3', localName: 'Name 3' },
            { id: 'rr', localName: 'Residential room', isResidential: true, locationType: 'ROOM' },
            { id: 'nrr', localName: 'Non-residential room', locationType: 'ROOM' },
          ],
        },
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('populateItems', () => {
    it('populates the items and error messages', async () => {
      await controller.populateItems(req, res, jest.fn())

      const { selectLocations } = req.form.options.fields
      expect(selectLocations.items).toEqual([
        {
          text: 'Name 1',
          value: 'id1',
        },
        {
          text: 'A-2',
          value: 'id2',
        },
        {
          text: 'Name 3',
          value: 'id3',
        },
        {
          text: 'Residential room',
          value: 'rr',
        },
      ])
      expect(selectLocations.fieldset.legend.text).toEqual('Select the wing you want to activate')
      expect(selectLocations.errorMessages.required).toEqual('Select which wing you want to activate')
    })
  })

  describe('locals', () => {
    it('sets the correct locals', async () => {
      const locals: { [key: string]: any } = controller.locals(req, res)
      expect(locals.backLink).toEqual(
        `/view-and-update-locations/${res.locals.location.prisonId}/${res.locals.location.id}`,
      )
      expect(locals.cancelLink).toEqual(
        `/view-and-update-locations/${res.locals.location.prisonId}/${res.locals.location.id}`,
      )
      expect(locals.fields).not.toEqual(undefined)
      expect(locals.validationErrors).toEqual([])
    })
  })

  describe('successHandler', () => {
    describe('when only 1 cell is selected', () => {
      beforeEach(() => {
        res.locals.locationResidentialSummary.subLocationName = 'Cells'
        req.form.values.selectLocations = ['id1']
      })

      it('redirects to the single cell reactivation flow', async () => {
        await controller.successHandler(req, res, jest.fn())

        expect(res.redirect).toHaveBeenCalledWith(
          `/reactivate/cell/id1?ref=parent&refPrisonId=${res.locals.location.prisonId}&refLocationId=${res.locals.location.id}`,
        )
      })
    })
  })
})
