import express from 'express'

import reactivateCellRouter from './cell'
import reactivateCellsRouter from './cells'

const router = express.Router({ mergeParams: true })

router.use('/cell/:locationId', reactivateCellRouter)
router.use('/cells', reactivateCellsRouter)

export default router
