import middleware from './middleware'
import addBreadcrumb from './addBreadcrumb'

const addRootBreadcrumb = middleware((req, res, next) => {
  const { user, prisonId } = res.locals
  let title = 'Locations'

  if (prisonId) {
    if (req.canAccess('certificate_view_management') || user.activeCaseload.id !== prisonId) {
      const caseload = user.caseloads.find(c => c.id === prisonId)

      if (caseload) {
        title += ` - ${caseload.name}`
      }
    }
  }

  addBreadcrumb({ title, href: `/${prisonId ?? ''}` })(req, res, null)

  next()
})

export default addRootBreadcrumb
