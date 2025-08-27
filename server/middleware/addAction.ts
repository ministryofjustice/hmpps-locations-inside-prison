import asyncMiddleware from './asyncMiddleware'

export default function addAction(action: { text: string; href: string; class?: string }) {
  return asyncMiddleware((req, res, next) => {
    const newAction = { class: 'govuk-button--secondary', ...action }

    res.locals.actions = res.locals.actions || []
    res.locals.actions.push(newAction)

    if (next) {
      next()
    }
  })
}
