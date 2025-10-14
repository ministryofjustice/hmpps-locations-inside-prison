import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import BaseController from './baseController'

export default class Details extends BaseController {
  override _process(req: FormWizard.Request, res: Response, next: NextFunction) {
    super._process(
      {
        ...req,
        body: {
          ...req.body,
          'update-signed-op-cap_currentSignedOpCap': `${res.locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity}`,
        },
      },
      res,
      next,
    )
  }

  override getValues(
    req: FormWizard.Request,
    res: Response,
    callback: (err: Error, values?: FormWizard.Values) => void,
  ) {
    return super.getValues(req, res, (err: Error, values?: FormWizard.Values) => {
      callback(err, {
        ...values,
        'update-signed-op-cap_currentSignedOpCap':
          res.locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
      })
    })
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const approvalRequests = await req.services.locationsService.getCertificateApprovalRequests(
      req.session.systemToken,
      res.locals.prisonId,
    )
    const requestMaxCapacityChange = approvalRequests.reduce((acc, request) => acc + request.maxCapacityChange, 0)

    super.validateFields(req, res, (errors: FormWizard.Errors) => {
      const { values } = req.form
      let { maxCapacity } = res.locals.prisonResidentialSummary.prisonSummary

      const { capacity, pendingChanges } = res.locals.decoratedResidentialSummary.location
      if (pendingChanges.maxCapacity !== undefined) {
        maxCapacity += pendingChanges.maxCapacity - capacity.maxCapacity
      }

      maxCapacity += requestMaxCapacityChange

      const validationErrors: FormWizard.Errors = {}

      if (!errors['update-signed-op-cap_newSignedOpCap']) {
        if (Number(values['update-signed-op-cap_newSignedOpCap']) > maxCapacity) {
          validationErrors['update-signed-op-cap_newSignedOpCap'] = this.formError(
            'update-signed-op-cap_newSignedOpCap',
            'doesNotExceedEstMaxCap',
          )
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { values } = req.form

    req.sessionModel.set('proposedSignedOpCapChange', {
      prisonId: res.locals.prisonId,
      signedOperationalCapacity: Number(values['update-signed-op-cap_newSignedOpCap']),
      reasonForChange: values['update-signed-op-cap_explanation'],
    })

    super.saveValues(req, res, next)
  }
}
