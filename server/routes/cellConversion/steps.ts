import FormWizard from 'hmpo-form-wizard'
import CellConversionAccommodationType from '../../controllers/cellConversion/accommodationType'
import CellConversionUsedFor from '../../controllers/cellConversion/usedFor'
import CellConversionSpecificCellType from '../../controllers/cellConversion/specificCellType'
import CellConversionSetCellType from '../../controllers/cellConversion/setCellType'
import CellConversionSetCellCapacity from '../../controllers/cellConversion/setCellCapacity'
import CellConversionConfirm from '../../controllers/cellConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'

const steps: FormWizard.Steps = {
  '/': {
    backLink: (req, res) => {
      const { id, prisonId } = res.locals.decoratedLocation

      return req.isEditing ? `/location/${id}/cell-conversion/confirm` : `/view-and-update-locations/${prisonId}/${id}`
    },
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: (req, _res) => req.featureFlags.createAndCertify,
        next: 'cert-change-disclaimer',
      },
      'accommodation-type',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'accommodation-type',
    title: (_req, _res) => `Cell conversion`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)} conversion`,
    description: (_req, _res) => `converting a non-residential to a cell`,
  }),
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
