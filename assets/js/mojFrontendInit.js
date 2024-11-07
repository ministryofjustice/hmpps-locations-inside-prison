window.MOJFrontend.initAll()

// Disable autocomplete for the select all checkbox
window.MOJFrontend.MultiSelect.prototype.getToggleHtml = function () {
  var html = ''
  html += '<div class="govuk-checkboxes__item govuk-checkboxes--small moj-multi-select__checkbox">'
  html += '  <input type="checkbox" class="govuk-checkboxes__input" id="checkboxes-all" autocomplete="off">'
  html += '  <label class="govuk-label govuk-checkboxes__label moj-multi-select__toggle-label" for="checkboxes-all">'
  html += '    <span class="govuk-visually-hidden">Select all</span>'
  html += '  </label>'
  html += '</div>'
  return html
}
