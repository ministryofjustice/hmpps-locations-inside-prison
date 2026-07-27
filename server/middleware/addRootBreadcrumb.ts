import middleware from './middleware'
import addBreadcrumb from './addBreadcrumb'

const addRootBreadcrumb = middleware((req, res, next) => {
  const { user, prisonId } = res.locals
  let title = 'Residential locations'

  if (prisonId) {
    if (req.canAccess('certificate_view_management') || user.activeCaseload.id !== prisonId) {
      title += ` - ${user.caseloads.find(c => c.id === prisonId).name}`
    }
  }

  addBreadcrumb({ title, href: `/${prisonId ?? ''}` })(req, res, null)

  next()
})

export default addRootBreadcrumb
