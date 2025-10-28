import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import IngestUpload, { invalidDataForPrison, parseCsvRow, summarizeCapacityByWing } from './upload'
import { BulkCapacityUpdate, CapacitySummary } from '../../../data/types/locationsApi/bulkCapacityChanges'
import fields from '../../../routes/changeLocalName/fields'

describe('Upload file csv', () => {
  const controller = new IngestUpload({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

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
      services: {},
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
        buttonText: 'Upload',
        cancelLink: '/admin/TST',
        cancelText: 'Cancel and return to prison configuration details',
        title: 'Upload cell cert data',
      })
    })
  })

  describe('validateFields', () => {
    it('validation fails when no file is present', async () => {
      deepReq.file = undefined

      const expectedError = controller.formError('file', 'required')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ file: expectedError }))
    })

    it('validation failure for an incorrectly formatted file', async () => {
      deepReq.file = {
        path: 'uploads/testdata/bad-format.csv',
      } as unknown as Express.Multer.File

      const expectedError = controller.formError('file', 'parseFailure')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ file: expectedError }))
    })

    it('validation failure as prison does not match', async () => {
      deepReq.file = {
        path: 'uploads/testdata/correct-format.csv',
      } as unknown as Express.Multer.File

      deepRes.locals.prisonConfiguration.prisonId = 'XXX'

      const expectedError = controller.formError('file', 'invalidPrison')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ file: expectedError }))
    })

    it('validation failure when there is no rows of data', async () => {
      deepReq.file = {
        path: 'uploads/testdata/empty-correct-format.csv',
      } as unknown as Express.Multer.File

      const expectedError = controller.formError('file', 'noData')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ file: expectedError }))
    })

    it('correct format file and prison is valid', async () => {
      deepReq.file = {
        path: 'uploads/testdata/correct-format.csv',
      } as unknown as Express.Multer.File

      deepRes.locals.prisonConfiguration.prisonId = 'EYI'

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({}))
    })
  })

  describe('saveValues', () => {
    it('the csv is transformed and the data saved in the session', async () => {
      deepReq.file = {
        path: 'uploads/testdata/correct-format.csv',
      } as unknown as Express.Multer.File

      deepRes.locals.prisonConfiguration.prisonId = 'EYI'

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledTimes(2)

      expect(deepReq.sessionModel.set).toHaveBeenNthCalledWith(1, 'capacityData', {
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
      })

      expect(deepReq.sessionModel.set).toHaveBeenNthCalledWith(2, 'capacitySummary', {
        HB1: {
          certifiedNormalAccommodation: 2,
          maxCapacity: 2,
          workingCapacity: 2,
        },
      })
    })
  })

  describe('parseCsvRow', () => {
    it('parses a fully valid row correctly', () => {
      const input = ['HB1,EYI-HB1-1-001,A1-01,2,2,1,Normal Accommodation,TRUE']
      const result = parseCsvRow(input)
      expect(result).toEqual({
        'EYI-HB1-1-001': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
      })
    })

    it('defaults maxCapacity to 1 if 0 is provided', () => {
      const input = ['HB1,EYI-HB1-1-002,A1-02,1,0,1,Normal Accommodation,FALSE']
      const result = parseCsvRow(input)
      expect(result['EYI-HB1-1-002'].maxCapacity).toBe(1)
    })

    it('defaults workingCapacity to 0 if null is provided', () => {
      const input = ['HB1,EYI-HB1-1-003,A1-03,3,3,null,Normal Accommodation,TRUE']
      const result = parseCsvRow(input)
      expect(result['EYI-HB1-1-003'].workingCapacity).toBe(0)
    })

    it('handles null inCellSanitation', () => {
      const input = ['HB2,EYI-HB2-1-004,A1-04,1,1,1,Normal Accommodation,null']
      const result = parseCsvRow(input)
      expect(result['EYI-HB2-1-004'].inCellSanitation).toBe(undefined)
    })

    it('handles undefined inCellSanitation', () => {
      const input = ['HB2,EYI-HB2-1-004,A1-04,1,1,1,Normal Accommodation,']
      const result = parseCsvRow(input)
      expect(result['EYI-HB2-1-004'].inCellSanitation).toBe(undefined)
    })

    it('parses multiple rows correctly', () => {
      const input = [
        'HB1,EYI-HB1-1-001,A1-01,2,2,1,Normal Accommodation,TRUE',
        'HB1,EYI-HB1-1-002,A1-02,1,0,1,Normal Accommodation,FALSE',
        'HB1,EYI-HB1-1-003,A1-03,3,3,null,Normal Accommodation,TRUE',
        'HB2,EYI-HB2-1-004,A1-04,1,1,1,Normal Accommodation,null',
        'HB2,EYI-HB2-1-005,A1-05,5,2,2,Normal Accommodation,TRUE',
      ]

      const result = parseCsvRow(input)

      expect(result).toEqual({
        'EYI-HB1-1-001': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB1-1-002': {
          maxCapacity: 1, // 0 becomes 1
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-02',
          inCellSanitation: false,
        },
        'EYI-HB1-1-003': {
          maxCapacity: 3,
          workingCapacity: 0, // null becomes 0
          certifiedNormalAccommodation: 3,
          cellMark: 'A1-03',
          inCellSanitation: true,
        },
        'EYI-HB2-1-004': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-04',
          inCellSanitation: undefined,
        },
        'EYI-HB2-1-005': {
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 5,
          cellMark: 'A1-05',
          inCellSanitation: true,
        },
      })
    })
  })

  describe('invalidDataForPrison', () => {
    it('returns false when all keys match the prisonId prefix', () => {
      const prisonId = 'ABC'
      const data: BulkCapacityUpdate = {
        'ABC-HB1-1-001': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'ABC-HB1-1-002': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-02',
          inCellSanitation: false,
        },
      }

      expect(invalidDataForPrison(prisonId, data)).toBe(false)
    })

    it('returns true when at least one key does not match the prisonId prefix', () => {
      const prisonId = 'ABC'
      const data: BulkCapacityUpdate = {
        'ABC-HB1-1-001': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'XYZ-HB1-1-002': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-02',
          inCellSanitation: false,
        },
      }

      expect(invalidDataForPrison(prisonId, data)).toBe(true)
    })

    it('returns true when all keys do not match the prisonId prefix', () => {
      const prisonId = 'ABC'
      const data: BulkCapacityUpdate = {
        'XYZ-HB1-1-001': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'XYZ-HB1-1-002': {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-02',
          inCellSanitation: false,
        },
      }

      expect(invalidDataForPrison(prisonId, data)).toBe(true)
    })

    it('returns false for empty data', () => {
      const prisonId = 'ABC'
      const data: BulkCapacityUpdate = {}

      expect(invalidDataForPrison(prisonId, data)).toBe(false)
    })
  })

  describe('summarizeCapacityByWing', () => {
    it('correctly summarizes capacity data grouped by wing', () => {
      const capacityData: BulkCapacityUpdate = {
        'EYI-HB1-1-001': {
          maxCapacity: 1,
          workingCapacity: 0,
          certifiedNormalAccommodation: 1,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB1-1-002': {
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-04',
          inCellSanitation: true,
        },
        'EYI-HB1-1-003': {
          maxCapacity: 3,
          workingCapacity: 2,
          certifiedNormalAccommodation: 3,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB2-1-001': {
          maxCapacity: 7,
          workingCapacity: 2,
          certifiedNormalAccommodation: 3,
          cellMark: 'A1-04',
          inCellSanitation: true,
        },
        'EYI-HB2-1-002': {
          maxCapacity: 8,
          workingCapacity: 2,
          certifiedNormalAccommodation: 4,
          cellMark: 'A1-01',
          inCellSanitation: true,
        },
        'EYI-HB2-1-003': {
          maxCapacity: 3,
          workingCapacity: 4,
          certifiedNormalAccommodation: 2,
          cellMark: 'A1-04',
          inCellSanitation: true,
        },
      }

      const expected: CapacitySummary = {
        HB1: {
          maxCapacity: 6,
          workingCapacity: 3,
          certifiedNormalAccommodation: 6,
        },
        HB2: {
          maxCapacity: 18,
          workingCapacity: 8,
          certifiedNormalAccommodation: 9,
        },
      }

      const result = summarizeCapacityByWing(capacityData)
      expect(result).toEqual(expected)
    })

    it('returns an empty summary for empty input', () => {
      const result = summarizeCapacityByWing({})
      expect(result).toEqual({})
    })

    it('handles malformed keys gracefully', () => {
      const malformedData: BulkCapacityUpdate = {
        BADKEY: {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          cellMark: 'X1',
          inCellSanitation: false,
        },
      }

      const result = summarizeCapacityByWing(malformedData)
      expect(result).toEqual({
        UNKNOWN: {
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
        },
      })
    })
  })
})
