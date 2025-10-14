import CommonTransaction from '../commonTransaction'
import steps from './steps'
import fields from './fields'

const UpdateSignedOpCap = new CommonTransaction({
  fields,
  steps,
  pathPrefix: '/update-signed-op-cap',
})
export default UpdateSignedOpCap
