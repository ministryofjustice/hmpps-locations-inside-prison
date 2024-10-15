document.addEventListener('DOMContentLoaded', function () {
  const enterButton = document.querySelector('.local-name-text-input')

  if (enterButton) {
    enterButton.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        document.querySelector('form').submit()
      }
    })
  }
})
