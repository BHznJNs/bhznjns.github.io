# 这个我调试了一早上的 bug 在我关掉 flclash 之后就好了！？

## 背景

我正在开发一个 LLM Client，其中使用的我自己基于 litellm 封装的 LLM Client 库。
我今天早上在测试时突然发现程序无法正常获取我自己部署的 NewAPI 服务的模型列表。
最开始我以为是我的封装层出了问题，但是在尝试用单独脚本直接调用 litellm 的 API 后发现同样失败，这才明白可能是 litellm 内部的问题。

（这里吐槽一下 litellm 的 API 设计，litellm 的 get_valid_models API 居然在请求时出现连接问题时不报错，只返回空数组。这一度让我误以为是我的 NewAPI 服务出了问题，各位千万不要这样设计 API）

## Debug 的过程

我尝试直接调用了 litellm 的 get_valid_models 下调用的 API，才发现确实是网络连接问题，而且根据报错内容 `[WinError 10054] An existing connection was forcibly closed by the remote host` 知道可能是已经建立连接后出现的错误。

尝试让 Gemini 帮忙解决，Gemini 给出以下建议：
1. 尝试关闭代理软件后测试（由于我的站点在关闭代理后无法直接通过浏览器访问，所以这个方法不行）
2. 调整 cloudflare 设置（我在关闭了所有的可能屏蔽请求的设置项，并添加了根据 User-Agent 跳过 WAF 的规则后依然不行）
3. 尝试使用 Python 的 curl_ffi 直接请求（通过 curl 能够正常请求到结果）

由于通过 curl 能够正确拿到结果，我就以为可能是 User-Agent 的问题导致请求被 CF 屏蔽。直到我手动将 curl 的请求头中的 UA 换成 httpx（即 litellm 使用的 http 客户端库）的默认请求头后发现也能正确请求（不过我这里忘记尝试 litellm 的默认 UA）。

于是尝试直接使用 httpx 的不做任何配置的 client 直接请求，发现一样能通。到此，Gemini 建议我尝试替换 litellm 的 client 为裸 httpx client 进行请求。这里是最见鬼的。我原本直接使用 httpx 的 client 能通，在重新添加了 litellm 的请求代码后，litellm 和 httpx 一起不通了？？

连 Gemini 都看蒙了：
> 这太离谱了，但同时也让我们抓住了问题的真凶：**状态污染与不稳定的本地网络环境。**

不过这也提醒我了。我尝试关闭 flclash，打开 clash verge rev 后重新发起请求，问题就这样好了 :smiling_face_with_tear:。

最后，我把结果告诉 Gemini，它的反应：
> 这确实很让人意外，但也正好印证了那个经典的结论：**网络问题，有时候真的是驱动和底层实现的“锅”**。
