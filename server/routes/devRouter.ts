import { Router, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

import FormStep from '../controllers/base/formStep'
import { permissionNameMap } from '../lib/permissions'
import middleware from '../middleware/middleware'
import config from '../config'

const devRouter = Router({ mergeParams: true })
devRouter.use(
  middleware((req, res, next) => {
    if (!config.developerMode) {
      res.redirect('/')
      return
    }

    next()
  }),
)
devRouter.use(
  '/set-permissions',
  FormWizard(
    {
      '/': {
        entryPoint: true,
        reset: true,
        resetJourney: true,
        skip: true,
        backLink: '/',
        next: 'permissions',
      },
      '/permissions': {
        pageTitle: 'Set user permissions',
        fields: ['roles'],
        template: '../../partials/formStep',
        controller: class extends FormStep {
          override getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
            return { roles: req.cookies.roleOverride?.split(', ') || res.locals.user.userRoles }
          }

          override saveValues(req: FormWizard.Request, res: Response) {
            res.cookie('roleOverride', (req.form.values.roles as string[]).join(', '))

            req.journeyModel.reset()
            req.sessionModel.reset()

            req.flash('success', {
              title: 'Role override updated',
              content: `New roles: ${(req.form.values.roles as string[]).map(r => permissionNameMap[r]).join(', ')}.`,
            })

            res.redirect('/')
          }
        },
      },
    },
    {
      roles: {
        component: 'govukCheckboxes',
        multiple: true,
        id: 'roles',
        name: 'roles',
        label: {
          text: 'Roles',
        },
        fieldset: {
          legend: {
            text: 'Roles',
            classes: 'govuk-fieldset__legend--m',
          },
        },
        items: Object.entries(permissionNameMap).map(([value, text]) => ({ text, value })),
      },
    },
    {
      name: 'dev-set-permissions',
      templatePath: 'pages/addToCertificate',
      csrf: false,
    },
  ),
)

devRouter.use('/reset-permissions', (req, res) => {
  res.clearCookie('roleOverride')

  req.flash('success', {
    title: 'Role override reset',
    content: '',
  })

  res.redirect('/')
})

export default devRouter
