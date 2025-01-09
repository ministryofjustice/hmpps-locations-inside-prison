function updateCheckedCount() {
  const selected = $('.govuk-checkboxes__input:checked').length - $('#checkboxes-all:checked').length
  const actionBar = $('.sticky-select-action-bar')
  if (!actionBar.length) {
    return
  }

  if (selected) {
    actionBar.addClass('sticky-select-action-bar--active')
    actionBar.find('.sticky-select-action-bar__count').text(`${selected} cell${selected > 1 ? 's' : ''} selected`)
  } else {
    actionBar.removeClass('sticky-select-action-bar--active')
  }
}

module.exports = mojFrontend => {
  // Disable autocomplete for the select all checkbox
  mojFrontend.MultiSelect.prototype.getToggleHtml = function () {
    return (
      '' +
      '<div class="govuk-checkboxes__item govuk-checkboxes--small moj-multi-select__checkbox">' +
      '  <input type="checkbox" class="govuk-checkboxes__input" id="checkboxes-all" autocomplete="off">' +
      '  <label class="govuk-label govuk-checkboxes__label moj-multi-select__toggle-label" for="checkboxes-all">' +
      '    <span class="govuk-visually-hidden">Select all</span>' +
      '  </label>' +
      '</div>'
    )
  }

  $(() => {
    const multiSelect = new mojFrontend.MultiSelect({
      container: '.moj-multi-select',
      checkboxes: '.govuk-checkboxes__input:not(#checkboxes-all)',
    })

    $('.sticky-select-action-bar__clear-link').on('click', () => {
      multiSelect.uncheckAll()
      multiSelect.toggleButton[0].checked = false
      updateCheckedCount()
    })

    $('.govuk-checkboxes__input').on('click', updateCheckedCount)
  })
}
