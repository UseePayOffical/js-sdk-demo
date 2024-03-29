const open = require('open')
const md5 = require('md5')
const axios = require('axios')
const qs = require('qs')
var path = require('path')

const bodyParser = require('body-parser')
const NodeRSA = require('node-rsa')

const express = require('express')
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../frontend')))

var server = app.listen(9001, '0.0.0.0', function () {
  var host = server.address().address
  var port = server.address().port
})

// ENV
const USEEPAY_SANDBOX_ENDPOINT = 'https://pay-gateway1.uat.useepay.com/cashier'
const USEEPAY_MERCHANT_NO = 'Your merchant no'
const USEEPAY_APP_ID = 'Your App Id'
const USEEPAY_SIGN_TYPE = 'Your sign type'

// MD5 Secret Key
const USEEPAY_MERCHANT_MD5_SECRET_KEY = 'YOUR_SECRET_KEY'

// RSA Keys
const USEEPAY_RSA_PUBLICK_KEY = "UseePay's RSA publick key in MC"

const MERCHANT_RSA_PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\n' +
  'Your RSA private Key' +
  '-----END PRIVATE KEY-----'

// Ngrok(内网穿透工具，也可使用其它内网穿透工具)分配的Host
const NGROK_URL = 'http://localhost:9001'

app.get('/', function (req, res) {
  res.sendFile('frontend/' + 'index.html', { root: './' })
})

app.post('/payment/token', function (req, res) {
  const request = buildCreatePaymentTokenRequestData(req)
  axios
    .post(USEEPAY_SANDBOX_ENDPOINT, qs.stringify(request))
    .then(function (response) {
      res.send({
        success: true,
        data: {
          token: response.data.token,
        },
        message: 'request successfully',
      })
    })
    .catch(function (error) {
      res.send({
        success: false,
        data: null,
        message: error.toString(),
      })
    })
})

app.post('/payment/result', function (req, res) {
  const value = JSON.parse(req.body['result'])
  if (verifySignature(value)) {
    // verify signature
    res.send({
      success: true,
      data: {
        transactionStatus: value.resultCode,
        message: value['errorMsg'],
      },
      message: 'Request successfully',
    })
  } else {
    res.send({
      success: false,
      data: null,
      message: 'Invalid transaction, signature error',
    })
  }
})

// 接收异步通知
app.post('/notify/useepay', function (req, res) {})

function buildCreatePaymentTokenRequestData(httpRequest) {
  const request = {}
  request['transactionType'] = 'pay'
  request['version'] = '1.0'
  request['signType'] = USEEPAY_SIGN_TYPE
  request['merchantNo'] = USEEPAY_MERCHANT_NO
  request['transactionId'] = new Date().getTime() + ''
  request['transactionExpirationTime'] = '30'
  request['appId'] = USEEPAY_APP_ID
  request['amount'] = '1234'
  request['currency'] = 'USD'
  request['notifyUrl'] = NGROK_URL + '/notify/useepay'
  request['autoRedirect'] = 'false'
  request['terminalType'] = 'WEB'
  request['country'] = 'US'

  const payerInfo = {
    paymentMethod: 'credit_card',
    authorizationMethod: 'cvv',
  }

  const threeDS2RequestData = {}
  threeDS2RequestData['deviceChannel'] = 'browser'
  threeDS2RequestData['acceptHeader'] = httpRequest.headers['accept']
  threeDS2RequestData['colorDepth'] = getValidColorDepth(
    parseInt(httpRequest.body['colorDepth']),
  )
  threeDS2RequestData['javaEnabled'] = httpRequest.body['javaEnabled']
  threeDS2RequestData['language'] = httpRequest.body['language']
  threeDS2RequestData['screenHeight'] = httpRequest.body['screenHeight']
  threeDS2RequestData['screenWidth'] = httpRequest.body['screenWidth']
  threeDS2RequestData['timeZoneOffset'] = httpRequest.body['timeZoneOffset']
  threeDS2RequestData['userAgent'] = httpRequest.headers['user-agent']

  const billingAddress = {}
  billingAddress['houseNo'] = 'House No'
  billingAddress['email'] = 'customer@customer.com'
  billingAddress['phoneNo'] = '13212345678'
  billingAddress['firstName'] = 'First Name'
  billingAddress['lastName'] = 'Last Name'
  billingAddress['street'] = 'Street address'
  billingAddress['postalCode'] = '20000'
  billingAddress['city'] = 'billingCity'
  billingAddress['state'] = 'billingState'
  billingAddress['country'] = 'CN' // ISO 3166-1-alpha-2

  payerInfo['threeDS2RequestData'] = threeDS2RequestData
  payerInfo['billingAddress'] = billingAddress

  const orderInfo = {
    subject: '订单标题',
  }

  const goodsInfo = Array()
  goodsInfo.push(
    {
      name: 'abc',
      price: '1234',
      quantity: 1,
    },
    {
      name: 'abc',
      price: '1234',
      quantity: 1,
    },
  )

  const shippingAddress = {}
  shippingAddress['houseNo'] = 'House No'
  shippingAddress['email'] = 'customer@customer.com'
  shippingAddress['phoneNo'] = '13212345678'
  shippingAddress['firstName'] = 'First Name'
  shippingAddress['lastName'] = 'Last Name'
  shippingAddress['street'] = 'street address'
  shippingAddress['postalCode'] = '20000'
  shippingAddress['city'] = 'billingCity'
  shippingAddress['state'] = 'billingState'
  shippingAddress['country'] = 'CN' // ISO 3166-1-alpha-2

  orderInfo['goodsInfo'] = goodsInfo
  orderInfo['shippingAddress'] = shippingAddress

  const userInfo = {
    email: 'customer@customer.com',
    phoneNo: '13212345678',
    ip:
      httpRequest.headers['x-forwarded-for'] ||
      httpRequest.connection.remoteAddress,
  }

  request['payerInfo'] = JSON.stringify(payerInfo)
  request['orderInfo'] = JSON.stringify(orderInfo)
  request['userInfo'] = JSON.stringify(userInfo)
  request['sign'] = createSignature(request)

  return request
}

function createSignature(request) {
  if (request['signType'] == 'MD5') {
    return createMd5Signature(request)
  } else {
    return createRSASignature(request)
  }
}

function verifySignature(response) {
  if (response['signType'] == 'MD5') {
    return response['sign'] == createMd5Signature(response)
  } else if (response['signType'] == 'RSA') {
    return verifyRSASignature(response)
  } else {
    return 'false'
  }
}

function createMd5Signature(request) {
  const data = Object.keys(request)
    .sort()
    .reduce((obj, key) => {
      obj[key] = request[key]
      return obj
    }, {})
  var str = ''
  Object.keys(data).forEach((key) => {
    if (data[key] != '' && key != 'sign') {
      str = str + key + '=' + data[key] + '&'
    }
  })
  str = str + 'pkey=' + USEEPAY_MERCHANT_MD5_SECRET_KEY
  return md5(str)
}

function createRSASignature(request) {
  const data = Object.keys(request)
    .sort()
    .reduce((obj, key) => {
      obj[key] = request[key]
      return obj
    }, {})
  var str = ''
  Object.keys(data).forEach((key) => {
    if (data[key] != '' && key != 'sign') {
      str = str + key + '=' + data[key] + '&'
    }
  })
  str = str.substr(0, str.length - 1)
  return new NodeRSA(MERCHANT_RSA_PRIVATE_KEY, 'pkcs8-private').sign(
    Buffer.from(str),
    'base64',
  )
}

function verifyRSASignature(response) {
  const data = Object.keys(response)
    .sort()
    .reduce((obj, key) => {
      obj[key] = response[key]
      return obj
    }, {})
  var str = ''
  Object.keys(data).forEach((key) => {
    if (data[key] != '' && key != 'sign') {
      str = str + key + '=' + data[key] + '&'
    }
  })
  str = str.substr(0, str.length - 1)
  var result = new NodeRSA(USEEPAY_RSA_PUBLICK_KEY, 'pkcs8-public').verify(
    Buffer.from(str),
    response['sign'],
    'base64',
    'base64',
  )
  return result
}

function getValidColorDepth(colorDepth) {
  const validColorDepthArray = Array(1, 4, 8, 15, 16, 24, 32, 48)
  var index = -2
  for (var i = 0; i < validColorDepthArray.length; i++) {
    if (colorDepth == validColorDepthArray[i]) {
      return colorDepth
    } else if (colorDepth < validColorDepthArray[i]) {
      index = i - 1
      break
    }
  }
  if (index == -2) {
    return validColorDepthArray[validColorDepthArray.length - 1]
  } else if (index == -1) {
    return validColorDepthArray[0]
  } else {
    return validColorDepthArray[index]
  }
}

open(NGROK_URL)
