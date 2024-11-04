import express from 'express'

import reactivateCellRouter from './cell'
import reactivateCellsRouter from './cells'
import reactivateParentRouter from './parent'

const router = express.Router({ mergeParams: true })

router.use('/cell/:locationId', reactivateCellRouter)
router.use('/cells', reactivateCellsRouter)
router.use('/parent/:locationId', reactivateParentRouter)

export default router
