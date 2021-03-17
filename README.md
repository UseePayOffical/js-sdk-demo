# 运行
1. npm install
2. 将 server.js 中的相关配置(USEEPAY_MERCHNAT_NO, USEEPAY_MERCHANT_MD5_SECRET_KEY, USEEPAY_APP_ID, USEEPAY_SIGN_TYPE, USEEPAY_RSA_PUBLICK_KEY, MERCHANT_RSA_PRIVATE_KEY) 替换成您自己的配置
3. 使用内网穿透工具, 如 [Ngork](https://ngrok.com/) 关联到 server.js 中监听的端口(默认9001), 并将 server.js 中的 NGROK_URL 替换
4. 运行 `npm run build`
6. 访问 `YOUR_NGROK_HOST`

# Demo 中提供的加签方式实现:
- [x] MD5
- [x] RSA

## RSA 密钥对格式说明

**RSA 密钥对应为 1024 PKCS8 格式**

由于 demo 中使用了 [node-rsa](https://www.npmjs.com/package/node-rsa#load-key-from-pem-string) 进行了 RSA 的签名与验证签, MERCHANT_RSA_PRIVATE_KEY 不能省去行首与行尾, 格式应该如下:
```
-----BEGIN PRIVATE KEY-----
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx
-----END PRIVATE KEY-----
```

更多内容请访问: [UseePay JavaScript SDK 文档](https://useepay.gitbook.io/useepay/sdk/javascript)
