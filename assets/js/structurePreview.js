module.exports = () => {
  // ensures script won't run on other pages in app with no structure preview
  if (!$('#structurePreview').length) return
  $(() => {
    const levels = []
    for (let i = 0; i < 4; i += 1) {
      levels.push($(`#level${i + 1}`))
    }
    const structurePreviewContainer = $('#structurePreview')
    const lines = []
    for (let i = 0; i < 3; i += 1) {
      lines.push({
        v: $(`#line-v${i + 1}`),
        h: $(`#line-h${i + 1}`),
      })
    }
    lines.forEach(line => {
      line.v.hide()
      line.h.hide()
    })
    function positionDivsAndLines() {
      for (let i = 1; i < levels.length; i += 1) {
        const lastLevelPosition = levels[i - 1].position()
        const lastLevelWidth = levels[i - 1].outerWidth()
        const lastLevelHeight = levels[i - 1].outerHeight()
        levels[i].css({
          top: lastLevelPosition.top + lastLevelHeight,
          left: lastLevelPosition.left + lastLevelWidth,
        })
      }
      for (let i = 0; i < lines.length; i += 1) {
        const nextLevelText = levels[i + 1].find('p').text().trim()
        const { v: lineV, h: lineH } = lines[i]
        if (nextLevelText === '') {
          lineV.hide()
          lineH.hide()
        } else {
          const currentLevelPosition = levels[i].position()
          const currentLevelHeight = levels[i].outerHeight()
          const currentLevelWidth = levels[i].outerWidth()
          const nextLevelPosition = levels[i + 1].position()
          const nextLevelHeight = levels[i + 1].outerHeight()
          const height = nextLevelPosition.top - (currentLevelPosition.top + currentLevelHeight)
          lineV.css({
            top: currentLevelPosition.top + currentLevelHeight,
            left: currentLevelPosition.left + currentLevelWidth / 2,
            height: height + nextLevelHeight / 2,
            display: 'block',
          })
          const width = nextLevelPosition.left - (currentLevelPosition.left + currentLevelWidth / 2)
          lineH.css({
            top: currentLevelPosition.top + currentLevelHeight + height + nextLevelHeight / 2,
            left: currentLevelPosition.left + currentLevelWidth / 2,
            width,
            display: 'block',
          })
        }
      }
      // set height for gov-inset-text
      const totalHeight = levels.reduce((acc, currentLevel) => acc + currentLevel.outerHeight(), 0)
      structurePreviewContainer.css({
        height: totalHeight,
      })
    }
    $(document).on('change', 'select.govuk-select', function () {
      positionDivsAndLines()
    })
    $(document).on('click', 'button, a', function () {
      positionDivsAndLines()
    })
    // ensure preview runs after DOM has loaded
    $(() => {
      positionDivsAndLines()
    })
  })
}
