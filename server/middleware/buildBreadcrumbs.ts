import asyncMiddleware from './asyncMiddleware'

export default function buildBreadcrumbs() {
  return asyncMiddleware((req, res, next) => {
    res.locals.breadcrumbs = [
      // {
      //   title: 'test 1',
      //   href: '#',
      // },
      // {
      //   title: 'test 2',
      //   href: '#',
      // },
    ]

    next()
  })
}
