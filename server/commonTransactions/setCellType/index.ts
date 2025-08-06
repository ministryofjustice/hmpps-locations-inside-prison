import CommonTransaction from '../commonTransaction'
import steps from './steps'
import fields from './fields'

const SetCellType = new CommonTransaction({
  fields,
  steps,
  pathPrefix: '/set-cell-type',
})
export default SetCellType
