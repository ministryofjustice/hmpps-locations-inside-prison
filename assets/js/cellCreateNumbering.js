module.exports = () => {
  $('#apply-cell-numbering').on('click', function (e) {
    e.preventDefault()
    const $input = $('#startCreateCellNumber')
    const $formGroup = $input.parent('.govuk-form-group')
    const $inputVal = $input.val()
    const numberToStartFrom = Number($input.val())
    let $errorSummary
    let errorMessage

    // Clear errors
    $formGroup.removeClass('govuk-form-group--error')
    $input.removeClass('govuk-input--error')
    $input.prev('.govuk-form-group--error').remove()
    $errorSummary = $('#js-govuk-error-summary')
    $errorSummary.remove()

    $('.govuk-error-summary__list li').each(function () {
      if ($(this).find('a').attr('href') === '#startCreateCellNumber') {
        $(this).remove()
      }
    })

    if (!$inputVal || Number.isNaN(numberToStartFrom)) {
      $errorSummary = $('.govuk-error-summary')
      const numeric = 'Enter a valid starting cell number'
      const required = 'Enter a number to start cell numbering from'

      errorMessage = !$inputVal ? required : numeric

      // Add error to form group
      $formGroup.addClass('govuk-form-group--error')
      $input.addClass('govuk-input--error')

      if (!$input.prev().is('#startCreateCellNumber-error')) {
        $input.before(
          `<div class="govuk-form-group govuk-form-group--error govuk-!-margin-bottom-0">
        <p id="startCreateCellNumber-error" class="govuk-error-message govuk-input-prefix--plain">
          <span class="govuk-visually-hidden">Error:</span> ${errorMessage}
        </p>
      </div>`,
        )
      }

      // If there is not an error summary, display one
      if ($errorSummary.length === 0) {
        const errorSummary = `
          <div class="govuk-width-container">
            <div class="govuk-grid-row govuk-!-margin-bottom-0">
              <div class="govuk-grid-column-two-thirds">
                <div class="govuk-error-summary" id="js-govuk-error-summary"
                     aria-labelledby="error-summary-title"
                     role="alert" tabindex="-1"
                     data-module="govuk-error-summary">
                  <h2 class="govuk-error-summary__title" id="error-summary-title">
                    There is a problem
                  </h2>
                  <div class="govuk-error-summary__body">
                    <ul class="govuk-list govuk-error-summary__list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>`
        $('.govuk-main-wrapper').prepend(errorSummary)
        $errorSummary = $('#js-govuk-error-summary')
      }

      // If there is, add error to end of error list
      $errorSummary.find('.govuk-error-summary__list').prepend(`
        <li><a href="#startCreateCellNumber">${errorMessage}</a></li>
      `)

      return false
    }

    $('input[id^="create-cells_cellNumber"]').each(function (index) {
      $(this).val(numberToStartFrom + index)
    })

    return true
  })
}
