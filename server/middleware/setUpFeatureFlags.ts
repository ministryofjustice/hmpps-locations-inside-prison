import type { Router } from 'express'
import express from 'express'
import config from '../config'

const router = express.Router()

export default function setUpFeatureFlags(): Router {
  const flags = { ...config.featureFlags }

  router.use((req, _res, next) => {
    req.featureFlags = flags
    next()
  })

  if (process.env.FEATURE_FLIPPER_ENABLED === 'true') {
    router.get('/set-feature-flag', (req, res) => {
      ;(Object.entries(req.query) as [keyof typeof flags, string][]).forEach(([key, val]) => {
        flags[key] = val === 'enabled'
      })
      res.sendStatus(200)
    })
  }

  return router
}
