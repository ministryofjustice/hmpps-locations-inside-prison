import asyncMiddleware from './asyncMiddleware'

export default function addAction(action: { text: string; href: string }) {
  return asyncMiddleware((req, res, next) => {
    res.locals.actions = res.locals.actions || []

    res.locals.actions.push(action)

    if (next) {
      next()
    }
  })
}
