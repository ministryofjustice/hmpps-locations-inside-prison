import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ReactivateCellsInit from './init'
import paths from '../../../utils/paths'

describe('ReactivateCellsInit', () => {
  const controller = new ReactivateCellsInit({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      form: { options: {} },
      session: {},
      sessionModel: { set: jest.fn() },
      query: {
        prisonId: 'TST',
        locationId: 'l0',
      },
    }
    deepRes = {
      redirect: jest.fn(),
      locals: {
        prisonId: 'TST',
        locationId: 'l0',
      },
    }
  })

  describe('successHandler', () => {
    describe('when multiple locations are selected', () => {
      beforeEach(() => {
        deepReq.query.selectedLocations = ['l1', 'l2', 'l3']
      })

      it('sets values on the sessionModel', async () => {
        await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('selectedLocations', deepReq.query.selectedLocations)
      })
    })

    describe('when a single location is selected', () => {
      beforeEach(() => {
        deepReq.query.selectedLocations = 'l1'
      })

      it('it redirects to single cell reactivation', async () => {
        await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith(
          `${paths.location.reactivate.cell('TST', deepReq.query.selectedLocations as string)}?ref=inactive-cells&refPrisonId=TST&refLocationId=l0`,
        )
      })
    })

    describe('when no locations are selected', () => {
      it('it redirects to the inactive-cells screen', async () => {
        await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith(
          paths.location.inactiveCells(deepReq.query.prisonId as string, deepReq.query.locationId as string),
        )
      })
    })
  })
})
