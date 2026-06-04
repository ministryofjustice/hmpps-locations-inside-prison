import { Response } from 'express'

export default function isCertActiveAndNotDraft({
  prisonConfiguration,
  decoratedLocation,
}: Response['locals']): boolean {
  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && decoratedLocation?.status !== 'DRAFT'
}
