module.exports = () => {
  const maxLevels = 4

  function getVisibleLevelWrappers() {
    return $('.level-wrapper:visible')
  }

  const levelType = $('#levelType')

  function updateStructurePreview() {
    const levelWrappers = getVisibleLevelWrappers()

    const level2Text = levelWrappers.eq(0).find('select option:selected').text().trim() || ''
    const level3Text = levelWrappers.eq(1).find('select option:selected').text().trim() || ''
    const level4Text = levelWrappers.eq(2).find('select option:selected').text().trim() || ''

    $('#level2 p').text(level2Text)
    $('#level3 p').text(level3Text)
    $('#level4 p').text(level4Text)

    // addresses issue for cypress tests not rendering structure preview
    if (typeof window.positionDivsAndLines === 'function') {
      window.positionDivsAndLines()
    }
  }

  function addLevel() {
    const visibleWrappers = getVisibleLevelWrappers()

    const currentValues = visibleWrappers
      .map(function () {
        return $(this).find('select').val()
      })
      .get()

    const wrapperToShow = $('.level-wrapper.hidden').first()
    if (!wrapperToShow.length) return

    wrapperToShow.removeClass('hidden')

    relabelLevels()

    const updatedWrappers = getVisibleLevelWrappers()

    updatedWrappers.each(function (index) {
      const wrapper = $(this)
      const select = wrapper.find('select')

      // if validation errors, set previous values
      if (index < currentValues.length) {
        select.val(currentValues[index])
        // index 0 = Level 2
      } else if (index === 0) {
        select.val('Landings')
      } else if (index === 1 || index === 2) {
        select.val('Cells')
      }
    })

    updateStructurePreview()
    updateButtonVisibility()
  }

  function removeLevel(removeLink) {
    // hides level wrapper and shows addLevel button
    const wrapper = $(removeLink).closest('.level-wrapper')
    wrapper.addClass('hidden').find('select').val('')

    $('#addLevel').show()
    relabelLevels()
    updateStructurePreview()
  }

  function relabelLevels() {
    const visibleLevels = getVisibleLevelWrappers()

    visibleLevels.each(function (index) {
      const newLevel = index + 2
      const wrapper = $(this)

      wrapper.attr('id', `level-${newLevel}-wrapper`)

      wrapper.find('h2').text(`Level ${newLevel} type`)

      const select = wrapper.find('select')
      select.attr('id', `level-${newLevel}`)
      select.attr('name', `level-${newLevel}`)

      wrapper.find('label').attr('for', `level-${newLevel}`)
    })
  }

  function updateButtonVisibility() {
    const visibleWrappers = getVisibleLevelWrappers()
    if (visibleWrappers.length >= maxLevels - 1) {
      $('#addLevel').hide()
    } else {
      $('#addLevel').show()
    }
  }

  $(() => {
    updateStructurePreview()
    updateButtonVisibility()

    $('#addLevel').on('click', e => {
      e.preventDefault()
      addLevel()
      updateButtonVisibility()
    })

    levelType.on('click', '.remove-level', function (e) {
      e.preventDefault()
      removeLevel(this)
      updateButtonVisibility()
    })

    levelType.on('change', 'select', updateStructurePreview)

    // whenever select is hidden, ensure no value is set
    $('form').on('submit', () => {
      $('.level-wrapper.hidden select').val('')
    })
  })
}
