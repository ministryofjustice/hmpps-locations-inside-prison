import express from 'express'

import reactivateCellRouter from './cell'

const router = express.Router({ mergeParams: true })

router.use('/cell/:locationId', reactivateCellRouter)

export default router
