# 开始尝试 Vibe Coding

## 起因

之前在刷油管的时候看到这个视频：[VS Code Agent Mode Just Changed Everything](https://www.youtube.com/watch?v=dutyOc_cAEU)

我对于 VSCode 集成了 AI 功能感到有些惊讶，虽然我之前就对于 AI 编辑器 Cursor 和 Windsurf 有所耳闻，但没想到 VSCode 会这么快跟进，而且能够免费使用。

## VSCode Copilot

于是我更新了 VSCode，新版本的 VSCode 已经自带了 Copilot 相关功能，并预装了 Copilot 插件。
登录账号，把 Copilot 设置为 Agent 模式，就可以直接让它帮我改动编辑器中的代码了。

改动编辑器中的代码只是最基础的功能，我也可以让它读取工作区中的一些文件，再基于这些文件进行操作。或者直接指定一些文件或者文件夹，让它自己读取。

Copilot 也有 Cursor 中非常受欢迎的功能：Next edit。这个功能乍一看和传统的 AI 补全有些相似，但是它有一个特点：它不只是在当前编辑位置继续编辑，而是根据用户当前的操作，预测用户下一步可能的编辑操作，帮助完成（和其名字非常相称）。

但是 Copilot 有两个缺点：
1. 对于免费用户有使用限额：虽然 Copilot 支持设置自己的 API key，但是依然会使用到 Copilot 自身的聊天消息和代码的限额。
2. 功能不够稳定：在使用自己的 API key 时，可能和模型能力有关，在聊天界面发出编辑要求时，有时会出现 Copilot 将描述编辑操作的 JSON 返回给用户而没有实际进行编辑的情况。

## Cline

于是我又开始尝试其它解决方案。
最终我选择了在其他博客中见过多次的 Cline。
Cline 的使用体验很好，无需登录，填入从 Google AI Studio 获取的免费 API key 即可使用。
虽然 Cline 相比 Copilot 少了自动补全和 Next edit 的功能，不过对于我个人反而是加分项。毕竟 Copilot 的自动补全和 Next edit 的提示常常会在我不希望的时候跳出来，打断思路，没有反而用着更舒服些。
为了规避 Gemini 免费 API key 请求频率的限制，我使用开源的 [gemini-balance](https://github.com/snailyp/gemini-balance) 搭建了一个自己的 API key 池使用。

## 其它工具

我同样尝试过 Cline 的一个社区分支，Roo Code，有着相似的使用体验，同时有更多的设置项，不过我个人觉得 Cline 的使用体验已经足够，浅尝后就移除了 Roo Code。

我也尝试过给 Cline 安装一些近来常见到讨论的 MCP Server，虽然 Cline 自己有提供 MCP Marketplace，在点击安装后就会跳转到聊天界面，然后 Cline 就会自动开始配置；但是按照我自己的使用体验来说，在自动安装完成后往往是无法正常使用的。我也尝试过自己在本地安装，虽然可以正常使用，但是每次要用时还要手动启用 Server，还是有些麻烦。我同样尝试过在 Cloudflare Workers 上搭建远程 MCP Server，但是由于很多 MCP Server 的实现语言不一致，我对 Cloudflare Workers 也完全不了解，仅仅只是尝试着把官方的 [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) 示例部署之后就不了了之。

我在迁移到 Cline 之后同样尝试过其它的代码补全插件：
- Google 官方的编程插件 Gemini Code Assist 在我使用时无法正常登录，自然也无法使用
- 我同样尝试过虽然是小厂但效果很好的 Fitten Code，但在一番尝试后感觉我并不需要这种基于 AI 的代码补全，就放弃了进一步的尝试。
