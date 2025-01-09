module.exports = () => {
  $(() => {
    $('.local-name-text-input').on('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        $(this).closest('form').submit()
      }
    })
  })
}
