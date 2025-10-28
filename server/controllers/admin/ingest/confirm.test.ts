import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import IngestConfirm, { processBulkCapacityUpdate } from './confirm'
import fields from '../../../routes/changeLocalName/fields'
import LocationsService from '../../../services/locationsService'
import { BulkCapacityUpdate } from '../../../data/types/locationsApi/bulkCapacityChanges'

describe('Ingest the cell cert data', () => {
  const controller = new IngestConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const mockUpdateBulkCapacity = jest.fn()

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      file: undefined,
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
        },
        values: {},
      },
      services: {
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(),
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        prisonConfiguration: {
          prisonId: 'TST',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      deepRes.locals.prisonConfiguration.prisonId = 'TST'
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/admin/TST',
        buttonText: 'Confirm ingestion',
        cancelLink: '/admin/TST',
        cancelText: 'Cancel and return to prison configuration details',
        capacityData: undefined,
        capacitySummary: undefined,
        title: 'Confirm cell certification ingest',
      })
    })
  })

  describe('saveValues', () => {
    it('the capacity data is transformed and saved', async () => {
      deepReq.sessionModel.get = jest.fn().mockImplementation(key =>
        key === 'capacityData'
          ? {
              'EYI-HB1-1-001': {
                cellMark: 'A1-01',
                certifiedNormalAccommodation: 1,
                inCellSanitation: true,
                maxCapacity: 1,
                workingCapacity: 1,
              },
              'EYI-HB1-1-004': {
                cellMark: 'A1-04',
                certifiedNormalAccommodation: 1,
                inCellSanitation: true,
                maxCapacity: 1,
                workingCapacity: 1,
              },
            }
          : null,
      )

      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockResolvedValueOnce({
        'EYI-HB1-1-001': [
          {
            key: 'EYI-HB1-1-001',
            message: 'Capacity updated',
          },
        ],
        'EYI-HB1-1-004': [
          {
            key: 'EYI-HB1-1-004',
            message: 'Capacity not changed',
          },
        ],
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.get).toHaveBeenCalledTimes(1)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledTimes(1)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', {
        'EYI-HB1-1-001': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB1-1-004': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-04',
          inCellSanitation: true,
        },
      })

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('updateMessages', [
        'EYI-HB1-1-001 = Capacity updated',
        'EYI-HB1-1-004 = Capacity not changed',
      ])
    })
  })

  describe('processBulkCapacityUpdate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const expectedChunks = {
      HB1: {
        'EYI-HB1-1-001': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB1-1-002': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-02',
          inCellSanitation: false,
        },
      },
      HB2: {
        'EYI-HB2-1-001': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-03',
          inCellSanitation: true,
        },
        'EYI-HB2-1-002': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-04',
          inCellSanitation: false,
        },
      },
    }

    const mockChangeHB1Response = {
      'EYI-HB1-1-001': [
        {
          key: 'EYI-HB1-1-001',
          message: 'Capacity not changed',
        },
      ],
      'EYI-HB1-1-002': [
        {
          key: 'EYI-HB1-1-002',
          message: 'Capacity not changed',
        },
      ],
    }
    const mockChangeHB2Response = {
      'EYI-HB2-1-001': [
        {
          key: 'EYI-HB2-1-001',
          message: 'Capacity not changed',
        },
      ],
      'EYI-HB2-1-002': [
        {
          key: 'EYI-HB2-1-002',
          message: 'Capacity not changed',
        },
      ],
    }

    const expectedMerged = {
      'EYI-HB1-1-001': [
        {
          key: 'EYI-HB1-1-001',
          message: 'Capacity not changed',
        },
      ],
      'EYI-HB1-1-002': [
        {
          key: 'EYI-HB1-1-002',
          message: 'Capacity not changed',
        },
      ],
      'EYI-HB2-1-001': [
        {
          key: 'EYI-HB2-1-001',
          message: 'Capacity not changed',
        },
      ],
      'EYI-HB2-1-002': [
        {
          key: 'EYI-HB2-1-002',
          message: 'Capacity not changed',
        },
      ],
    }

    it('should group and process data and perform a bulk update in order', async () => {
      const input: BulkCapacityUpdate = {
        'EYI-HB1-1-001': expectedChunks.HB1['EYI-HB1-1-001'],
        'EYI-HB1-1-002': expectedChunks.HB1['EYI-HB1-1-002'],
        'EYI-HB2-1-001': expectedChunks.HB2['EYI-HB2-1-001'],
        'EYI-HB2-1-002': expectedChunks.HB2['EYI-HB2-1-002'],
      }
      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockResolvedValueOnce(mockChangeHB1Response)
      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockResolvedValueOnce(mockChangeHB2Response)

      const result = await processBulkCapacityUpdate('token', locationsService, input)

      expect(mockUpdateBulkCapacity).toHaveBeenCalledTimes(2)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', expectedChunks.HB1)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', expectedChunks.HB2)

      expect(result).toEqual(expectedMerged)
    })

    it('should group and process data and perform a bulk update out of order', async () => {
      const input: BulkCapacityUpdate = {
        'EYI-HB2-1-001': expectedChunks.HB2['EYI-HB2-1-001'],
        'EYI-HB1-1-002': expectedChunks.HB1['EYI-HB1-1-002'],
        'EYI-HB2-1-002': expectedChunks.HB2['EYI-HB2-1-002'],
        'EYI-HB1-1-001': expectedChunks.HB1['EYI-HB1-1-001'],
      }

      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockResolvedValueOnce(mockChangeHB1Response)
      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockResolvedValueOnce(mockChangeHB2Response)

      const result = await processBulkCapacityUpdate('token', locationsService, input)

      expect(mockUpdateBulkCapacity).toHaveBeenCalledTimes(2)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', expectedChunks.HB1)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', expectedChunks.HB2)

      expect(result).toEqual(expectedMerged)
    })

    it('should handle a not found location', async () => {
      const input: BulkCapacityUpdate = {
        'EYI-HB1-1-001': expectedChunks.HB1['EYI-HB1-1-001'],
        'EYI-HB1-1-002': expectedChunks.HB1['EYI-HB1-1-002'],
      }

      const errorObj = {
        data: {
          status: 404,
          userMessage: 'Location not found: There is no location found for ID = EYI-HB1-1-001',
          developerMessage: 'There is no location found for ID = EYI-HB1-1-001',
          errorCode: 101,
        },
        message: 'Not Found',
      }

      locationsService.updateBulkCapacity = mockUpdateBulkCapacity.mockRejectedValueOnce(errorObj)

      const result = await processBulkCapacityUpdate('token', locationsService, input)

      expect(mockUpdateBulkCapacity).toHaveBeenCalledTimes(1)
      expect(mockUpdateBulkCapacity).toHaveBeenCalledWith('token', expectedChunks.HB1)

      const expectedWithError = {
        'EYI-HB1-1-001': [
          {
            key: 'ERROR: (complete wing HB1 not ingested)',
            message: 'Location not found: There is no location found for ID = EYI-HB1-1-001',
          },
        ],
      }

      expect(result).toEqual(expectedWithError)
    })
  })
})
