# VSCode 插件开发的小坑

我今日尝试开发一个 VSCode 插件，按照 ChatGPT 的指引，我使用了命令

```shell
npm install -g yo generator-code
yo code
```

来创建项目。

在我尝试运行查看插件效果时，发现虽然用于查看运行效果的 VSCode 窗口能被打开，但是却没有预期的插件效果。

## 解决办法

在持续询问 GPT 解决方案之后，终于有了一条有效的解决方案：

> 强制检查 VS Code 的行为
> 
> - 打开调试宿主窗口后，按 F1，选择 Developer: Toggle Developer Tools。
> - 切换到 Console 标签，检查是否有任何与插件相关的报错。

在照着操作后，我在控制台中发现了如下报错：

```shell
ERR [/d:/MyPrograms/frontend-programs/markdown-blog-ext]: Extension is not compatible with Code 1.92.0. Extension requires: ^1.96.0.
```

在 ``package.json`` 中进行如下修改后，插件成功运行：

```json
"engines": {
    "vscode": "^1.92.0"
}
```
