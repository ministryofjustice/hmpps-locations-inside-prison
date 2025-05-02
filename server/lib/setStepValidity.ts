import FormWizard from 'hmpo-form-wizard'

export default function setStepValidity(req: FormWizard.Request, pathMatch: string, valid: boolean) {
  const journeyHistory = req.journeyModel.get('history') as FormWizard.HistoryStep[]
  const matchedStep = journeyHistory.find(step => step.path.includes(pathMatch))
  if (!matchedStep) return

  matchedStep.invalid = !valid
  matchedStep.revalidate = !valid
  req.journeyModel.set('history', journeyHistory)
}
