import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ReactivateParentSelect from './select'
import fields from '../../../routes/reactivate/parent/fields'
import LocationFactory from '../../../testutils/factories/location'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('ReactivateParentSelect', () => {
  const controller = new ReactivateParentSelect({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
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
    deepReq = {
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
        get: jest.fn(
          (fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        }),
        cells: [
          LocationFactory.build({
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          }),
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
            LocationFactory.build({ id: 'id1', localName: 'Name 1' }),
            LocationFactory.build({ id: 'id2', pathHierarchy: 'A-2' }),
            LocationFactory.build({ id: 'id3', localName: 'Name 3' }),
            LocationFactory.build({
              id: 'rr',
              localName: 'Residential room',
              isResidential: true,
              locationType: 'ROOM',
            }),
            LocationFactory.build({
              id: 'nrr',
              localName: 'Non-residential room',
              locationType: 'ROOM',
              isResidential: false,
            }),
          ],
        },
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    }
  })

  describe('populateItems', () => {
    it('populates the items and error messages', async () => {
      await controller.populateItems(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      const { selectLocations } = deepReq.form.options.fields
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
      const locals: { [key: string]: any } = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(locals.backLink).toEqual(
        `/view-and-update-locations/${deepRes.locals.decoratedLocation.prisonId}/${deepRes.locals.decoratedLocation.id}`,
      )
      expect(locals.cancelLink).toEqual(
        `/view-and-update-locations/${deepRes.locals.decoratedLocation.prisonId}/${deepRes.locals.decoratedLocation.id}`,
      )
      expect(locals.fields).not.toEqual(undefined)
      expect(locals.validationErrors).toEqual([])
    })
  })

  describe('successHandler', () => {
    describe('when only 1 cell is selected', () => {
      beforeEach(() => {
        deepRes.locals.locationResidentialSummary.subLocationName = 'Cells'
        deepReq.form.values.selectLocations = ['id1']
      })

      it('redirects to the single cell reactivation flow', async () => {
        await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

        expect(deepRes.redirect).toHaveBeenCalledWith(
          `/reactivate/cell/id1?ref=parent&refPrisonId=${deepRes.locals.decoratedLocation.prisonId}&refLocationId=${deepRes.locals.decoratedLocation.id}`,
        )
      })
    })
  })
})
