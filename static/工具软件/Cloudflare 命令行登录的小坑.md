# Cloudflare 命令行登录的小坑

如果你是混迹在网络中的白嫖党，对于“大善人”Cloudflare 的大名应该不陌生。
Cloudflare 最有名而慷慨的服务可能就是其名为 Workers 的 Serverless 服务了。

在使用 Workers 时，需要使用 Cloudflare 提供的 Wrangler SDK 进行开发和部署。在部署时，这个工具会进行鉴权，以判断 Worker 的所属。
但是在鉴权时却很有可能遇到这个报错：

```
✘ [ERROR] The body of the response was HTML rather than JSON. Check the debug logs to see the full body of the response.


✘ [ERROR] It looks like you might have hit a bot challenge page. This may be transient but if not, please contact Cloudflare to find out what can be done. When you contact Cloudflare, please provide your Ray ID: 966b29db8af0fd61-SIN


This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:
Error: Invalid JSON in response: status: 403 Forbidden
    at getJSONFromResponse (D:\libs\npm\node_cache\_npx\d77349f55c2be1c0\node_modules\wrangler\wrangler-dist\cli.js:54159:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async exchangeAuthCodeForAccessToken (D:\libs\npm\node_cache\_npx\d77349f55c2be1c0\node_modules\wrangler\wrangler-dist\cli.js:53756:31)
    at async Server.<anonymous> (D:\libs\npm\node_cache\_npx\d77349f55c2be1c0\node_modules\wrangler\wrangler-dist\cli.js:53912:30)
```

这个报错在使用了代理的情况下尤其常见。

要绕过这个小坑，我们可以按照下面这个步骤进行登录：

1. 登录 Cloudflare 网页端
2. [在此](https://dash.cloudflare.com/profile/api-tokens)获取 API Token
3. 在命令行下设置环境变量
```shell
# unix
export CLOUDFLARE_API_TOKEN="YOUR_API_TOKEN"
# windows
$env:CLOUDFLARE_API_TOKEN="YOUR_API_TOKEN"
```
4. 在设置完成后，调用命令 ``npx wrangler whoami`` 进行登录

这样，wrangler 就会通过 API Token 进行登录了。
