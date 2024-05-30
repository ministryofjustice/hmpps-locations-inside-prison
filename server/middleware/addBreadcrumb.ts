import asyncMiddleware from './asyncMiddleware'

export default function addBreadcrumb(breadcrumb: { title: string; href: string }) {
  return asyncMiddleware((req, res, next) => {
    res.locals.breadcrumbs = res.locals.breadcrumbs || []

    res.locals.breadcrumbs.push(breadcrumb)

    next()
  })
}
