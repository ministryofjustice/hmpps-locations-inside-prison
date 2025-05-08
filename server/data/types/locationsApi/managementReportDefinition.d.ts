export declare interface ManagementReportDefinition {
  id: string
  name: string
  description: string
  variants: ReportVariant[]
  authorised: boolean
}

export type ReportVariant = {
  id: string
  name: string
  description: string
}
