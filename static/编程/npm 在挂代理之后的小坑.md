# npm 在挂代理之后的小坑

前段时间不怎么写前端项目，近来又重新开始折腾，谁知道 npm 上来就给了我一个下马威：

```bash
$ npm install
⠙(node:25096) [DEP0123] DeprecationWarning: Setting the TLS ServerName to an IP address is not permitted by RFC 6066. This will be ignored in a future version.
(Use `node --trace-deprecation ...` to show where the warning was created)
npm error A complete log of this run can be found in: D:\libs\npm\node_cache\_logs\2025-03-07T14_53_15_195Z-debug-0.log
```

我一头雾水，Google 一番后一无所获，还是问了 DeepSeek 才大概明白，和代理有关。
解决办法也很简单，由于我使用的是 Clash，就用 Clash 默认的 7897 混合端口了：
```bash
npm config set proxy http://localhost:7897
```
