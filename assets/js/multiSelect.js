function updateCheckedCount() {
  const selected = $('.govuk-checkboxes__input:checked').length - $('#locations-checkboxes-all:checked').length
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

module.exports = () => {
  $(() => {
    // TODO: remove this when https://github.com/ministryofjustice/moj-frontend/pull/1407 is merged and released
    $('#locations-checkboxes-all').attr('autocomplete', 'off')

    $('.govuk-checkboxes__input').on('change', updateCheckedCount)

    $('.sticky-select-action-bar__clear-link').on('click', () => {
      $('#locations-checkboxes-all').trigger('click')
      // click the select-all again if it is checked
      $('#locations-checkboxes-all:checked').trigger('click')
      updateCheckedCount()
    })
  })
}
