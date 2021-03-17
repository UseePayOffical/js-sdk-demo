# 运行
1. npm install
2. 将 server.js 中的相关配置(USEEPAY_MERCHNAT_NO, USEEPAY_MERCHANT_MD5_SECRET_KEY, USEEPAY_APP_ID, USEEPAY_SIGN_TYPE, USEEPAY_RSA_PUBLICK_KEY, MERCHANT_RSA_PRIVATE_KEY) 替换成您自己的配置
4. node server.js 默认端口为 9001
5. 使用内网穿透工具, 如 [Ngork](https://ngrok.com/) 关联到 server.js 中监听的端口
6. 访问 `YOUR_NGROK_HOST`

# Demo 中提供的加签方式实现:
- [x] MD5
- [x] RSA

## RSA 密钥对格式说明
RSA 密钥对应为 1024 PKCS8格式

更多内容请访问: [UseePay JavaScript SDK 文档](https://useepay.gitbook.io/useepay/sdk/javascript)
