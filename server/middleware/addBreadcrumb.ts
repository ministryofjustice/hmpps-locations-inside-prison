import middleware from './middleware'

export default function addBreadcrumb(breadcrumb: { title: string; href: string }) {
  return middleware((req, res, next?) => {
    res.locals.breadcrumbs = res.locals.breadcrumbs || []

    res.locals.breadcrumbs.push(breadcrumb)

    if (next) {
      next()
    }
  })
}
