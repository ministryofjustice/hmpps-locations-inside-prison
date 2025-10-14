import CreateLocationConfirmPage from '../../../../pages/createLocation/confirm'

export default function checkCellInformation(
  page: CreateLocationConfirmPage,
  cellsInformation: [string, string, string, string, string, string, string][],
) {
  for (let r = 0; r < cellsInformation.length; r += 1) {
    const cellInformation = cellsInformation[r]
    for (let c = 0; c < cellInformation.length; c += 1) {
      page.cellInformationTableCell(r, c).contains(new RegExp(String.raw`^${cellInformation[c]}$`))
    }
  }
}
