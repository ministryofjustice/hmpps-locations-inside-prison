import CellConversionAccommodationType from '../../controllers/cellConversion/accommodationType'
import CellConversionUsedFor from '../../controllers/cellConversion/usedFor'
import CellConversionSpecificCellType from '../../controllers/cellConversion/specificCellType'
import CellConversionSetCellType from '../../controllers/cellConversion/setCellType'
import CellConversionSetCellCapacity from '../../controllers/cellConversion/setCellCapacity'
import CellConversionConfirm from '../../controllers/cellConversion/confirm'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'accommodation-type',
  },
  '/accommodation-type': {
    controller: CellConversionAccommodationType,
    editable: true,
    fields: ['accommodationType'],
    next: [{ field: 'accommodationType', value: 'NORMAL_ACCOMMODATION', next: 'used-for' }, 'specific-cell-type'],
  },
  '/used-for': {
    editable: true,
    controller: CellConversionUsedFor,
    fields: ['usedForTypes'],
    next: 'specific-cell-type',
  },
  '/specific-cell-type': {
    editable: true,
    controller: CellConversionSpecificCellType,
    fields: ['hasSpecificCellType'],
    next: [{ field: 'hasSpecificCellType', value: 'yes', next: 'set-cell-type' }, 'set-cell-capacity'],
  },
  '/set-cell-type': {
    editable: true,
    fields: ['specialistCellTypes'],
    controller: CellConversionSetCellType,
    next: 'set-cell-capacity',
  },
  '/set-cell-capacity': {
    editable: true,
    fields: ['workingCapacity', 'maxCapacity'],
    controller: CellConversionSetCellCapacity,
    next: 'confirm',
  },
  '/confirm': {
    controller: CellConversionConfirm,
  },
}

export default steps
