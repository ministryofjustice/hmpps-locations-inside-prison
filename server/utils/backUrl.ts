import { Request } from 'express'

const backUrl = (req: Request, { fallbackUrl, nextStepUrl }: { fallbackUrl?: string; nextStepUrl?: string }) => {
  let backLink
  const { referrerUrl } = req.session

  // Go back to the last page unless we already got here by clicking back from the next step
  if (nextStepUrl && !referrerUrl?.endsWith(nextStepUrl)) {
    backLink = referrerUrl
  }
  return backLink || fallbackUrl
}

export default backUrl
