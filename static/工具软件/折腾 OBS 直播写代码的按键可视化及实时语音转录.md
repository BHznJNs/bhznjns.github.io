# 折腾 OBS 直播写代码的按键可视化及实时语音转录

今天一时兴起，想再试试在 B 站直播写代码。但是之前直播

## 首先是通过 OBS Studio 进行第三方推流

通过 [bilibili_live_stream_code](https://github.com/ChaceQC/bilibili_live_stream_code/) 这个项目可以很轻松地实现自动获取 B 站的 Cookies，并且生成推流地址和密钥，在 OBS 中粘贴即可使用。

## 声音转录文本展示

我在调研一番后原本打算使用 [WhisperLiveKit](https://github.com/QuentinFuxa/WhisperLiveKit)，但是实际使用发现在我的电脑上可用性严重不足，遂放弃。
后来在 B 站搜索发现 Windows 自带的 Live Caption 功能也够用。

## 按键可视化

对于按键可视化，我一开始想要使用 BongoCat，但是[二次开发的版本](https://github.com/ayangweb/BongoCat)无法在 OBS 中截取窗口，而[原版](https://github.com/MMmmmoko/Bongo-Cat-Mver)又没法显示完整的键盘，遂放弃。
在 B 站搜索时发现可以使用类似于 [keyviz](https://github.com/mulaRahul/keyviz) 的软件实现按键可视化。keyviz 虽然有名，但是 1.x 版本无法进行纵向显示，2.x 版本支持但 Bug 又太多。本想放弃，但调研了一番竞品，要么颜值不足，要么不支持纵向显示，要么要付费，最后还是选择了 keyviz。
