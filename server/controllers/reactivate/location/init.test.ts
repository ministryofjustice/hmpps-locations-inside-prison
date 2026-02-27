import { DeepPartial } from 'fishery'
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import LocationFactory from '../../../testutils/factories/location'
import ReactivateLocationInit from './init'

describe('ReactivateLocationInit', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>
  let next: jest.Mock
  let reactivateLocationInit: ReactivateLocationInit

  beforeEach(() => {
    req = {
      sessionModel: {
        set: jest.fn(),
      },
      form: {
        options: {},
      },
    }
    res = {
      locals: {
        locationTree: [
          {
            location: LocationFactory.build({ id: 'cell1', locationType: 'CELL', specialistCellTypes: ['TYPE1'] }),
            subLocations: [],
          },
          {
            location: LocationFactory.build({ id: 'cell2', locationType: 'CELL', specialistCellTypes: [] }),
            subLocations: [],
          },
        ],
        locationResidentialSummary: {
          parentLocation: LocationFactory.build({ id: 'parent1', locationType: 'WING', specialistCellTypes: [] }),
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
    reactivateLocationInit = new ReactivateLocationInit({ route: 'route' })
  })

  describe('successHandler', () => {
    it('sets saved-cellTypes for cells with specialistCellTypes', async () => {
      await reactivateLocationInit.successHandler(req as FormWizard.Request, res as Response, next)
      expect(req.sessionModel.set).toHaveBeenCalledWith('saved-cellTypescell1', ['TYPE1'])
      expect(req.sessionModel.set).not.toHaveBeenCalledWith('saved-cellTypescell2', expect.anything())
    })

    it('uses parentLocation if no cells and parentLocation is CELL', async () => {
      res.locals.locationTree = []
      res.locals.locationResidentialSummary.parentLocation = LocationFactory.build({
        id: 'parent2',
        locationType: 'CELL',
        specialistCellTypes: ['TYPE2'],
      })
      await reactivateLocationInit.successHandler(req as FormWizard.Request, res as Response, next)
      expect(req.sessionModel.set).toHaveBeenCalledWith('saved-cellTypesparent2', ['TYPE2'])
    })

    it('calls super.successHandler', async () => {
      const superSpy = jest
        .spyOn(FormWizard.Controller.prototype, 'successHandler')
        .mockImplementation((_req, _res, n) => n())
      await reactivateLocationInit.successHandler(req as FormWizard.Request, res as Response, next)
      expect(superSpy).toHaveBeenCalled()
      superSpy.mockRestore()
    })
  })
})
