# 搭建 Gemini API key 池，免费爽用 Gemini

## 起因

尝试在 Cline 中使用 Gemini 的免费 API key，但是发现对于免费用户，其请求速率有一定限制，只要 Cline 自动执行的指令稍微多一些就会达到这个限制。于是开始寻找能够均衡使用好几个 API key 的方法。

## 尝试过的方案

我通过 Perplexity 搜索，找到了 [One API](https://github.com/songquanpeng/one-api) 这个项目，star 很多，但我实际使用后发现功能过于繁杂。对于基于其二次开发的 [One Hub](https://github.com/MartialBE/one-hub) 等项目也有类似的问题。

最后我找到了 [Gemini Balance](https://github.com/snailyp/gemini-balance) 这个项目，完美符合我的需求。跟随其[部署文档](https://gb-docs.snaily.top/guide/setup-hf.html)可以很轻松地使用一些现成的免费服务部署起一个远程的 API key 池。

## 部署之后遇到的问题

### 使用代理 IP

按照论坛网友的说法，同一个 Google 账号下不同的 Google Cloud Project 下的 API key 是独立计算额度的，于是我使用了两个 Google 账号，每个账号创建了 7 个项目，并在每个项目下创建了 key 放在池子中使用。
但是实际使用发现在 {RPM}(每分钟请求次数) 达到 20 不到时，就开始返回 429。
查询发现可能是因为虽然使用了不同的 key，但是是从相同的 IP 访问的。于是使用了 Cloudflare 的 AI Gateway。

>>> 附：AI Gateway 的使用
在 Cloudflare 中可以免费创建 AI Gateway，在创建时 platform 选择 ``Universal``，复制 Endpoint URL，这个 URL 差不多长这样：
```
https://gateway.ai.cloudflare.com/v1/xxxxxxxxxxxx/project-name/
```

实际使用时，在其后加上后缀：``google-ai-studio/v1beta`` 即可。
>>>

在 Gemini Balance 的配置中将 Base URL 设为 AI Gateway 的 Endpoint URL，这样就会通过 AI Gateway 来请求 Gemini 了。

### 同一个账号使用的 key 过多

在使用 AI Gateway 后，测试发现 RPM 依然差不多，求助得知可能是使用了同一账号过多的 key。
于是我将池子中的 key 数量减少到 4 个，两个 Google 账号各两个，测试的 RPM 果然达到了 30+，基本足够两个人爽用了。

## 附：速率限制测试方法

打开一个代码文件较多的项目，让 Cline 逐一读取项目中的每个代码文件（加以总结或进行 Review）。
如果觉得速度不够，可以同时打开好几个项目，并行进行。
