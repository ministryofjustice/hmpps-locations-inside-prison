import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class PrisonConfigurationIndexPage extends Page {
  constructor() {
    super('Manage prisons')
  }

  static goTo = () => cy.visit(paths.prisonConfiguration.index)

  rolloutSummary = (setting: 'residential' | 'certification'): PageElement => cy.get(`[data-qa=${setting}-rollout]`)

  prisonName = (prisonId: string): PageElement => cy.get(`[data-qa=name-${prisonId}]`)

  residentialStatus = (prisonId: string): PageElement => cy.get(`[data-qa=residential-status-${prisonId}]`)

  certificationStatus = (prisonId: string): PageElement => cy.get(`[data-qa=certification-status-${prisonId}]`)

  residentialToggle = (prisonId: string): PageElement => cy.get(`[data-qa=residential-toggle-${prisonId}]`)

  certificationToggle = (prisonId: string): PageElement => cy.get(`[data-qa=certification-toggle-${prisonId}]`)

  search = (): PageElement => cy.get('[data-qa=prison-search]')

  searchButton = (): PageElement => cy.get('[data-qa=prison-search-button]')

  successBanner = (): PageElement => cy.get('.govuk-notification-banner--success')

  errorBanner = (): PageElement => cy.get('[data-qa=error-banner]')
}
