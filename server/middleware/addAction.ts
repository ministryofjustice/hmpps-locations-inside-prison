import asyncMiddleware from './asyncMiddleware'

export default function addAction(action: { text: string; href: string; class?: string }) {
  return asyncMiddleware((req, res, next) => {
    const newAction = { ...action, class: action.class || 'govuk-button--secondary' }

    res.locals.actions = res.locals.actions || []
    res.locals.actions.push(newAction)

    if (next) {
      next()
    }
  })
}
