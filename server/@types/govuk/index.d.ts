type SummaryListRow = {
  classes?: string
  key: {
    text?: string
    html?: string
    classes?: string
  }
  value: {
    text?: string
    html?: string
    classes?: string
  }
  actions?: {
    items?: {
      href: string
      text?: string
      html?: string
      visuallyHiddenText?: string
      classes?: string
      attributes?: Record<string, string>
    }[]
    classes?: string
  }
}

// eslint-disable-next-line import/prefer-default-export
export { SummaryListRow }
