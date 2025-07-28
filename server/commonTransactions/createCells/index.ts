import CommonTransaction from '../commonTransaction'
import steps from './steps'
import fields from './fields'

const CreateCells = new CommonTransaction({
  fields,
  steps,
  pathPrefix: '/create-cells',
})
export default CreateCells
