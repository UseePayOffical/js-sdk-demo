# 运行
1. npm install
2. 将 server.js 中的相关配置(USEEPAY_MERCHNAT_NO, 'YOUR_MERCHNAT_NO'
const USEEPAY_MERCHNAT_SECRET_KEY, USEEPAY_APP_ID, USEEPAY_SIGN_TYPE) 替换成您自己的配置
4. node server.js 默认端口为 9001
5. 使用内网穿透工具, 如 [Ngork](https://ngrok.com/) 关联到 server.js 中监听的端口
6. 访问 `YOUR_NGROK_HOST`