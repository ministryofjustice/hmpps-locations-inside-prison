import { DeepPartial } from 'fishery'
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import RemoveCellType from './removeCellType'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'
import LocationFactory from '../../../testutils/factories/location'
import paths from '../../../utils/paths'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'

describe('RemoveCellType', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>
  let next: jest.Mock
  let removeCellType: RemoveCellType

  beforeEach(() => {
    req = {
      params: { cellId: 'cell1' },
      sessionModel: {
        unset: jest.fn(),
        set: jest.fn(),
      },
    }
    res = {
      locals: {},
      redirect: jest.fn(),
    }
    next = jest.fn()
    removeCellType = new RemoveCellType({ route: 'route' })
  })

  describe('successHandler', () => {
    describe('when editing a landing of a wing', () => {
      beforeEach(() => {
        res.locals.cell = LocationFactory.build({ id: 'cell1', parentId: 'landing1', locationType: 'CELL' })
        res.locals.decoratedLocation = buildDecoratedLocation({ id: 'wing1', locationType: 'WING' })
      })

      it('unsets temp-cellTypes and sets temp-cellTypes-removed, then redirects to parent edit-capacity', () => {
        removeCellType.successHandler(req as FormWizard.Request, res as Response, next)
        expect(req.sessionModel.unset).toHaveBeenCalledWith('temp-cellTypescell1')
        expect(req.sessionModel.set).toHaveBeenCalledWith('temp-cellTypescell1-removed', true)
        expect(res.redirect).toHaveBeenCalledWith(
          `${paths.location.reactivate.location(
            res.locals.decoratedLocation as DecoratedLocation,
          )}/edit-capacity/landing1`,
        )
      })
    })

    describe('when editing a standalone landing', () => {
      beforeEach(() => {
        res.locals.cell = LocationFactory.build({ id: 'cell1', parentId: 'landing1', locationType: 'CELL' })
        res.locals.decoratedLocation = buildDecoratedLocation({ id: 'landing1', locationType: 'LANDING' })
      })

      it('unsets temp-cellTypes and sets temp-cellTypes-removed, then redirects to self edit-capacity', () => {
        removeCellType.successHandler(req as FormWizard.Request, res as Response, next)
        expect(req.sessionModel.unset).toHaveBeenCalledWith('temp-cellTypescell1')
        expect(req.sessionModel.set).toHaveBeenCalledWith('temp-cellTypescell1-removed', true)
        expect(res.redirect).toHaveBeenCalledWith(
          `${paths.location.reactivate.location(
            res.locals.decoratedLocation as DecoratedLocation,
          )}/edit-capacity/landing1`,
        )
      })
    })
  })
})
