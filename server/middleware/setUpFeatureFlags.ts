import type { Router } from 'express'
import express from 'express'
import config from '../config'

const router = express.Router()

export default function setUpFeatureFlags(): Router {
  const flags: Record<string, boolean> = { ...config.featureFlags }

  router.use((req, res, next) => {
    req.featureFlags = flags
    next()
  })

  if (process.env.FEATURE_FLIPPER_ENABLED === 'true') {
    router.get('/set-feature-flag', (req, res) => {
      const flagsToSet = Object.entries(req.query as Record<string, string>).map(([key, val]): [string, boolean] => [
        key,
        val === 'enabled',
      ])

      flagsToSet.forEach(([key, val]) => {
        flags[key] = val
      })
      res.sendStatus(200)
    })
  }

  return router
}
