import { Request } from 'express'
import FormWizard from 'hmpo-form-wizard'

const backUrl = (
  req: Request | FormWizard.Request,
  { fallbackUrl, nextStepUrl = '' }: { fallbackUrl?: string; nextStepUrl?: string },
) => {
  let backLink
  const { referrerUrl } = req.session

  // Go back to the last page unless we already got here by clicking back from the next step
  if (!referrerUrl?.endsWith(nextStepUrl)) {
    backLink = referrerUrl
  }
  return backLink || fallbackUrl
}

export default backUrl
