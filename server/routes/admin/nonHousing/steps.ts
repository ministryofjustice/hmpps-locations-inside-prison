import NonHousingCheckboxChangeConfirm from '../../../controllers/admin/nonHousing/confirm'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'confirm',
  },
  '/confirm': {
    fields: ['disableNonHousingCheckboxes'],
    controller: NonHousingCheckboxChangeConfirm,
  },
}

export default steps
