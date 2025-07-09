module.exports = () => {
  // ensures script won't run on other pages in app with no structure preview
  if (!$('#structurePreview').length) return

  $(() => {
    const level1 = $('#level1')
    const level2 = $('#level2')
    const level3 = $('#level3')
    const level4 = $('#level4')
    const structurePreviewContainer = $('#structurePreview')

    const lineV1 = $('#line-v1')
    const lineH1 = $('#line-h1')
    const lineV2 = $('#line-v2')
    const lineH2 = $('#line-h2')
    const lineV3 = $('#line-v3')
    const lineH3 = $('#line-h3')

    lineV2.hide()
    lineH2.hide()
    lineV3.hide()
    lineH3.hide()

    function positionDivsAndLines() {
      const level1Position = level1.position()
      const level1Width = level1.outerWidth()
      const level1Height = level1.outerHeight()

      level2.css({
        top: level1Position.top + level1Height,
        left: level1Position.left + level1Width,
      })

      const level2Position = level2.position()
      const level2Width = level2.outerWidth()
      const level2Height = level2.outerHeight()

      level3.css({
        top: level2Position.top + level2Height,
        left: level2Position.left + level2Width,
      })

      const level3Position = level3.position()
      const level3Width = level3.outerWidth()
      const level3Height = level3.outerHeight()

      level4.css({
        top: level3Position.top + level3Height,
        left: level3Position.left + level3Width,
      })

      const level4Position = level4.position()
      const level4Height = level4.outerHeight()

      const level2Text = level2.find('p').text().trim()
      const level3Text = level3.find('p').text().trim()
      const level4Text = level4.find('p').text().trim()

      if (level2Text === '') {
        lineV1.hide()
        lineH1.hide()
      } else {
        const v1Height = level2Position.top - (level1Position.top + level1Height)
        lineV1.css({
          top: level1Position.top + level1Height,
          left: level1Position.left + level1Width / 2,
          height: v1Height + level2Height / 2,
          display: 'block',
        })

        const h1Width = level2Position.left - (level1Position.left + level1Width / 2)
        lineH1.css({
          top: level1Position.top + level1Height + v1Height + level2Height / 2,
          left: level1Position.left + level1Width / 2,
          width: h1Width,
          display: 'block',
        })
      }

      if (level3Text === '') {
        lineV2.hide()
        lineH2.hide()
      } else {
        const v2Height = level3Position.top - (level2Position.top + level2Height)
        lineV2.css({
          top: level2Position.top + level2Height,
          left: level2Position.left + level2Width / 2,
          height: v2Height + level3Height / 2,
          display: 'block',
        })

        const h2Width = level3Position.left - (level2Position.left + level2Width / 2)
        lineH2.css({
          top: level2Position.top + level2Height + v2Height + level3Height / 2,
          left: level2Position.left + level2Width / 2,
          width: h2Width,
          display: 'block',
        })
      }

      if (level4Text === '') {
        lineV3.hide()
        lineH3.hide()
      } else {
        const v3Height = level4Position.top - (level3Position.top + level3Height)
        lineV3.css({
          top: level3Position.top + level3Height,
          left: level3Position.left + level3Width / 2,
          height: v3Height + level4Height / 2,
          display: 'block',
        })

        const h3Width = level4Position.left - (level3Position.left + level3Width / 2)
        lineH3.css({
          top: level3Position.top + level3Height + v3Height + level4Height / 2,
          left: level3Position.left + level3Width / 2,
          width: h3Width,
          display: 'block',
        })
      }

      // set height for gov-inset-text
      const totalHeight = level1Height + level2Height + level3Height + level4Height
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
