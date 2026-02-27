import { DeepPartial } from 'fishery'
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import EditCapacity from './editCapacity'
import LocationFactory from '../../../testutils/factories/location'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

const mockModel = (originalValues: Record<string, any>) => {
  const values = { ...originalValues }

  return {
    get: jest.fn((fieldName?: string) => values[fieldName]),
    set: jest.fn((fieldName?: string, value?: any) => {
      values[fieldName] = value
    }),
    unset: jest.fn((fieldName?: string) => {
      delete values[fieldName]
    }),
    toJSON: jest.fn(() => values),
  } as any as FormWizard.Request['sessionModel']
}

describe('EditCapacity', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>
  let next: jest.Mock
  let editCapacity: EditCapacity
  let specialistCellTypes: Response['locals']['constants']['specialistCellTypes']

  beforeEach(() => {
    req = {
      params: { parentLocationId: 'parent1' },
      journeyModel: mockModel({}),
      sessionModel: mockModel({}),
      form: { options: { name: 'wizard', fields: {} }, values: {} },
      isEditing: false,
      notRevalidated: false,
      body: {},
      services: { locationsService: { getSpecialistCellTypes: jest.fn().mockResolvedValue([]) } },
      session: { systemToken: 'token' },
    }
    res = {
      locals: {
        decoratedLocation: buildDecoratedLocation({
          id: 'parent1',
          localName: 'Parent Location',
          locationType: 'WING',
        }),
        decoratedLocationTree: [
          {
            decoratedLocation: buildDecoratedLocation({ id: 'parent1', locationType: 'WING' }),
            decoratedSubLocations: [
              {
                decoratedLocation: buildDecoratedLocation({ id: 'cell1', locationType: 'CELL', parentId: 'parent1' }),
                decoratedSubLocations: [],
              },
            ],
          },
        ],
        locationResidentialSummary: { parentLocation: { accommodationTypes: [] } },
        cells: [
          LocationFactory.build({ id: 'cell1', parentId: 'parent1', locationType: 'CELL', specialistCellTypes: [] }),
        ],
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
    specialistCellTypes = [
      { key: 'TYPE1', description: 'Type 1', attributes: { affectsCapacity: true } },
      { key: 'TYPE2', description: 'Type 2', attributes: { affectsCapacity: false } },
    ]
    res.locals.constants = { specialistCellTypes }
    editCapacity = new EditCapacity({
      route: 'route',
    })
  })

  describe('fixHistory', () => {
    describe('when check-capacity step is missing', () => {
      it('should add check-capacity step', () => {
        req.journeyModel = mockModel({ history: [] })
        editCapacity.fixHistory(req as FormWizard.Request, res as Response, next)
        expect(req.journeyModel.set).toHaveBeenCalledWith('history', [
          {
            continueOnEdit: undefined,
            editing: undefined,
            next: '/reactivate/location/parent1/edit-capacity/parent1',
            path: '/reactivate/location/parent1/check-capacity',
            revalidate: false,
            skip: false,
            wizard: 'wizard',
          },
        ])
        expect(next).toHaveBeenCalled()
      })
    })

    describe('when check-capacity step is present', () => {
      it('should not modify history', () => {
        req.journeyModel = mockModel({
          history: [
            {
              path: '/reactivate/location/parent1/check-capacity',
            },
          ],
        })
        editCapacity.fixHistory(req as FormWizard.Request, res as Response, next)
        expect(req.journeyModel.set).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })
  })

  describe('populateCells', () => {
    it('should populate cells from decoratedLocationTree', () => {
      res.locals.cells = []
      req.params.parentLocationId = 'parent1'
      editCapacity.populateCells(req as FormWizard.Request, res as Response, next)
      expect(res.locals.cells.length).toBeGreaterThan(0)
      expect(next).toHaveBeenCalled()
    })

    it('should fallback to decoratedLocation.raw if no cells and locationType is CELL', () => {
      res.locals.cells = []
      res.locals.decoratedLocation = buildDecoratedLocation({ id: 'cell2', locationType: 'CELL', parentId: 'parent1' })
      req.params.parentLocationId = 'parent1'
      editCapacity.populateCells(req as FormWizard.Request, res as Response, next)
      expect(res.locals.cells.length).toBe(1)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('getParent', () => {
    it('should return correct parent in getParent', () => {
      req.params.parentLocationId = 'parent1'
      const parent = editCapacity.getParent(req as FormWizard.Request, res as Response)
      expect(parent.id).toBe('parent1')
    })
  })

  describe('locals', () => {
    it('should return correct locals', () => {
      const locals = editCapacity.locals(req as FormWizard.Request, res as Response)
      expect(locals.title).toContain('Edit capacity')
      expect(locals.titleCaption).toBe('Parent Location')
      expect(locals.minLayout).toBe('three-quarters')
    })
  })

  describe('getValues', () => {
    it('should call callback with getValues result', done => {
      const fakeValues = { foo: 'bar' }
      editCapacity.getValues = jest.fn((_req, _res, cb) => cb(null, fakeValues))
      editCapacity.getValues(req as FormWizard.Request, res as Response, (err, values) => {
        expect(values).toEqual(fakeValues)
        done()
      })
    })
  })

  describe('createDynamicFields', () => {
    it('should create dynamic fields for each cell', () => {
      res.locals.cells = [LocationFactory.build({ id: 'cell1', parentId: 'parent1', locationType: 'CELL' })]
      req.form.options.fields = {
        workingCapacity: { validate: [], errorSummaryPrefix: '' },
        baselineCna: { validate: [], errorSummaryPrefix: '' },
        maximumCapacity: { validate: [], errorSummaryPrefix: '' },
      }
      editCapacity.createDynamicFields(req as FormWizard.Request, res as Response, next)
      expect(Object.keys(req.form.options.fields)).toEqual([
        'workingCapacity-cell1',
        'baselineCna-cell1',
        'maximumCapacity-cell1',
      ])
      expect(next).toHaveBeenCalled()
    })
  })

  describe('validateFields', () => {
    describe('cellTypeAction: remove', () => {
      beforeEach(() => {
        req.body = { cellTypeAction: 'remove/cell1' }
      })

      it('should redirect to remove cell type', () => {
        editCapacity.validateFields(req as FormWizard.Request, res as Response, next)
        expect(res.redirect).toHaveBeenCalledWith('/reactivate/location/parent1/cell1/remove-cell-type')
        expect(next).not.toHaveBeenCalled()
      })
    })

    describe('cellTypeAction: set', () => {
      beforeEach(() => {
        req.body = { cellTypeAction: 'set/cell1' }
      })

      it('should redirect to set cell type', () => {
        editCapacity.validateFields(req as FormWizard.Request, res as Response, next)
        expect(res.redirect).toHaveBeenCalledWith('/reactivate/location/parent1/cell1/set-cell-type/init')
        expect(next).not.toHaveBeenCalled()
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      req.sessionModel = mockModel({
        'saved-cellTypescell1': 'SET',
        'temp-cellTypescell1-removed': true,
        'temp-cellTypescell2': 'SET',
      })
    })

    it('should unset and set correct keys', () => {
      editCapacity.saveValues(req as FormWizard.Request, res as Response, next)
      expect(req.sessionModel.toJSON()).toEqual({
        'saved-cellTypescell1-removed': true,
        'saved-cellTypescell2': 'SET',
      })
      expect(next).toHaveBeenCalled()
    })
  })
})
