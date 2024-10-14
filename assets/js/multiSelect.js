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

$(() => {
  const multiSelect = new MOJFrontend.MultiSelect({
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
