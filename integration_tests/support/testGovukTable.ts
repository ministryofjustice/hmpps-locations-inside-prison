export default function testGovukTable(dataQaTag: string, tableRows: (string | string[])[][]) {
  const row = (rowIndex: number) => cy.get(`[data-qa=${dataQaTag}] .govuk-table__body .govuk-table__row`).eq(rowIndex)
  const cell = (rowIndex: number, cellIndex: number) => row(rowIndex).find('th, td').eq(cellIndex)

  for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex += 1) {
    const tableRow = tableRows[rowIndex]
    for (let cellIndex = 0; cellIndex < tableRow.length; cellIndex += 1) {
      const cellContents =
        typeof tableRow[cellIndex] === 'string' ? [tableRow[cellIndex] as string] : (tableRow[cellIndex] as string[])

      cellContents.forEach(cellContent => {
        cell(rowIndex, cellIndex).should('contain', cellContent)
      })
    }
  }
}
