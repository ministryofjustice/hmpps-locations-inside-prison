import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import continuePreview from './continuePreview'
import LocationsService from '../../services/locationsService'

describe('Cell certificate imports - continue a preview', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      session: { systemToken: 'token' },
      services: { locationsService },
      params: { importId: 'preview-1' },
    }
    deepRes = {
      locals: { prisonConfiguration: { prisonId: 'TST' } },
      redirect: jest.fn(),
    }
  })

  afterEach(() => jest.clearAllMocks())

  it('starts the import and shows its progress', async () => {
    locationsService.continueCellCertificatePreview = jest.fn().mockResolvedValue({ id: 'import-2' })

    await continuePreview(deepReq as Request, deepRes as Response)

    expect(locationsService.continueCellCertificatePreview).toHaveBeenCalledWith('token', 'preview-1')
    expect(deepReq.flash).toHaveBeenCalledWith(
      'success',
      expect.objectContaining({ title: 'Cell certificate import started' }),
    )
    expect(deepRes.redirect).toHaveBeenCalledWith('/TST/cell-certificate-imports/import/import-2')
  })

  it('returns to the preview with the reason when it cannot be continued', async () => {
    locationsService.continueCellCertificatePreview = jest.fn().mockRejectedValue({
      data: { userMessage: 'Run the preview again before importing.' },
    })

    await continuePreview(deepReq as Request, deepRes as Response)

    expect(deepReq.flash).toHaveBeenCalledWith('error', {
      title: 'There is a problem',
      content: 'Run the preview again before importing.',
    })
    expect(deepRes.redirect).toHaveBeenCalledWith('/TST/cell-certificate-imports/import/preview-1')
  })

  it('gives a general reason when the API does not say why', async () => {
    locationsService.continueCellCertificatePreview = jest.fn().mockRejectedValue(new Error('timeout'))

    await continuePreview(deepReq as Request, deepRes as Response)

    expect(deepReq.flash).toHaveBeenCalledWith('error', {
      title: 'There is a problem',
      content: 'The import could not be started. Try again later.',
    })
  })
})
