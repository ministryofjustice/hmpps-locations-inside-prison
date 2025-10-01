export default function testGovukSummaryList(dataQaTag: string, rows: [string | string[], string | string[]][]) {
  const row = (rowIndex: number) => cy.get(`[data-qa=${dataQaTag}] .govuk-summary-list__row`).eq(rowIndex)

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const summaryListRow = rows[rowIndex]
    const cells = [row(rowIndex).find('.govuk-summary-list__key'), row(rowIndex).find('.govuk-summary-list__value')]

    for (let cellIndex = 0; cellIndex < summaryListRow.length; cellIndex += 1) {
      const cellContents =
        typeof summaryListRow[cellIndex] === 'string'
          ? [summaryListRow[cellIndex] as string]
          : (summaryListRow[cellIndex] as string[])

      cellContents.forEach(cellContent => {
        // NB: Removing this log statement causes the tests to fail, must be quantum computing related
        cy.task('log', `${rowIndex}/${cellIndex} ${cellContent}`)
        cells[cellIndex].should('contain', cellContent)
      })
    }
  }
}
