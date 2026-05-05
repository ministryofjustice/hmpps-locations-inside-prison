import Page from '../../../page'

export default class TooManyOccupantsPage extends Page {
  constructor() {
    super('You can’t approve this change because too many people are occupying the cell')
  }
}
