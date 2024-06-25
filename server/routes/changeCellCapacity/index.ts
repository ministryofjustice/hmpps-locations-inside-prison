import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'

const router = express.Router({ mergeParams: true })

router.use(wizard(steps, fields, {
  name: 'change-cell-capacity',
  template: 'pages/changeCellCapacity/index',
}))

export default router