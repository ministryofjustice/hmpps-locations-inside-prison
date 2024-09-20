import FormWizard from 'hmpo-form-wizard'

export default function setStepValidity(req: FormWizard.Request, pathMatch: string, valid: boolean) {
  const journeyHistory: any = req.journeyModel.get('history')
  const matchedStep = journeyHistory.find((step: any) => step.path.includes(pathMatch))
  if (!matchedStep) return

  matchedStep.invalid = !valid
  matchedStep.revalidate = !valid
  req.journeyModel.set('history', journeyHistory)
}
