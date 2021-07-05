var useepay
$(function () {
  useepay = UseePay({
    env: 'sandbox',
    layout: 'multiLine',
    locale: window.navigator.language,
    merchantId: 'YOUR_MERCHANT_ID'
  })
  useepay.mount(document.getElementById('cardElement'))

  useepay.on('change', function (valid, code, message) {
    if (valid) {
      $('#payBtn').attr('disabled', false)
      $('#errorTip').text('All input fields valid')
    } else {
      $('#payBtn').attr('disabled', true)
      $('#errorTip').text(message)
    }
  })

  $('#payBtn')
    .off('click')
    .on('click', function () {
      $('#payBtn').attr('disable', true)
      useepay.validate(function (valid, code, message) {
        if (valid) {
          pay()
        } else {
          $('#errorTip').text(message)
        }
      })
    })
})

function pay() {
  $.post(
    '/payment/token',
    {
      colorDepth: window && window.screen ? window.screen.colorDepth : '',
      javaEnabled:
        window && window.navigator ? window.navigator.javaEnabled() : false,
      screenHeight: window && window.screen ? screen.height : '',
      screenWidth: window && window.screen ? screen.width : '',
      timeZoneOffset: new Date().getTimezoneOffset(),
      language: window && window.navigator ? window.navigator.language : '',
    },
    function (resp) {
      console.log(resp)
      if (resp.success) {
        useepay.confirm(resp.data.token, function (data) {
          $('#payBtn').prop('disable', false)
          if (data.success) {
            $.post(
              '/payment/result',
              {
                result: data.data,
              },
              function (resp) {
                if (resp.success) {
                  alert(
                    'Transaction: ' +
                      resp.data.transactionStatus +
                      '\n' +
                      'Message:' +
                      resp.data.message,
                  )
                } else {
                  alert(resp.message)
                }
              },
            )
          } else {
            // error occurred
            alert(data.message)
          }
        })
      } else {
        $('#payBtn').prop('disable', false)
      }
    },
  )
}
