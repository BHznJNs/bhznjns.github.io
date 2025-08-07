# 初试 Claude Code

由于近来在使用 Roo Code 时遇到崩溃的情况，导致我被迫寻找一些备用方案。Claude Code 作为近几个月来最火热的 AI Coding Agent，自然是我第一时间能想到的选择。

- - -

## 配置

Claude Code 最开始只支持 Linux 端，Windows 端要使用需要在 WSL 中运行。
经过一段时间的发展，现在也是可以直接在 Windows 电脑上使用了。为了避免昂贵的 Claude 模型订阅费用，我使用 [claude-code-router](https://github.com/musistudio/claude-code-router) 来接入我自己的 API Key。

## 上手体验

刚刚上手时给我的感觉是很震撼的，TUI 程序相比于 Roo Code 这种基于 Web 技术的笨重的 VSCode 形态的应用还是轻量太多了。并且 Claude Code 的 TUI 的设计做得还是很好的，斜杠指令、@ 选择上下文等功能也具备。
在第一次启动时会自动在 VSCode 中安装 Claude Code 插件，可以说这个 setup 体验还是很好的。

但是好话也就到此为止了，接下都是吐槽了。

## 吐槽

### 不够开箱即用

比如常见的 AI Coding Agent 该有的功能：
- 调用工具或写入文件等操作时的自动允许
- 需要人来接管时的音效提醒
这些都默认不启用，需要自行摸索。

切换模式（分为普通模式、自动模式、Plan 模式）的快捷键在程序内没有提示，需要自行查文档。

不自带自动存档点功能，需要通过第三方插件实现。

以上这些问题在普通的 VSCode 插件上可能不会很明显，因为对于普通的 GUI 应用来说，用户会很自然地到设置界面中寻找自己需要的功能。但对于 CLI 程序来说，用户很可能需要调用一些特殊命令（比如启用音效提醒需要调用 ``claude config set -g preferredNotifChannel terminal_bell`` 这个命令）或者是修改配置文件才能完成需要的设置，这也导致用户上手门槛的提高。

--不过好在 Claude Code 的用户都是程序员，自适应能力还是比较强的 🐶--

### MCP 能力太弱

首先是不支持 MCP 的 Resources 和 Prompts。

不支持 Prompts 我能理解，毕竟 MCP 的 Prompts 目前不怎么看到被使用。但是 Resources 还算是有一些 MCP Server 在用的吧，也没有支持。

其次是目前在 Claude Code 中调用的 Agent 获知可用的 MCP 服务器以及对应有哪些工具可用还是通过系统提示词实现的。
对于系统提示词中不明确的 MCP 服务器，在用户要求调用时，Agent 会尝试通过自带的 ``listMcpResources`` 工具来获取目标 MCP 服务器上可用的工具，但是这个工具至少在我使用的过程中完全没法正常获取 MCP 服务器定义的工具和资源。
