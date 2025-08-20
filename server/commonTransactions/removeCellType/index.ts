import CommonTransaction from '../commonTransaction'
import steps from './steps'

const RemoveCellType = new CommonTransaction({
  steps,
  pathPrefix: '/remove-cell-type',
})
export default RemoveCellType
