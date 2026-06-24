import { DeepPartial } from 'fishery'
import { Response, Request } from 'express'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import populateExistingCells from './populateExistingCells'

describe('populateExistingCells', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    deepReq = {}
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          subLocationName: 'Cells',
          subLocations: [
            buildDecoratedLocation({ id: 'cell-1', status: 'ACTIVE' }),
            buildDecoratedLocation({ id: 'cell-2', status: 'DRAFT' }),
            buildDecoratedLocation({ id: 'cell-3', status: 'INACTIVE' }),
          ],
        },
      },
    }
  })

  it('sets cells to an empty array when the parent has no Cells sub-location', () => {
    deepRes.locals.decoratedResidentialSummary.subLocationName = 'Landings'

    populateExistingCells(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.cells).toEqual([])
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('maps subLocations and excludes DRAFT status locations', () => {
    populateExistingCells(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.cells.map(cell => ({ id: cell.id, status: cell.status }))).toEqual([
      { id: 'cell-1', status: 'ACTIVE' },
      { id: 'cell-3', status: 'INACTIVE' },
    ])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
