# Web 前端压缩视频最大化加载速度的实践

原文链接：[视频压缩到极致是种什么体验？122MB 到 4.9 MB，我的 AV1/HEVC/H.264 编码与 HTML5 播放器实践](https://zhuanlan.zhihu.com/p/1900946363786691369)

- - -

## 使用不同格式确保所有场景下的体验

在 ``video`` 标签中使用 ``source`` 标签，标签提供了 AV1、HEVC (H.265) 和 H.264 三种编码格式。浏览器会优先选择它支持的第一个资源，从 AV1 到 HEVC 再到 H.264，确保所有设备都能播放。

- 文件大小优化：AV1 和 HEVC 的高压缩率显著减小文件体积（相比你提到的 122 MB 的 H.264 视频），加载更快，节省带宽。
- 广泛兼容性：从前沿的 AV1 到通用的 H.264，确保视频在任何设备上都能流畅播放。
- 用户体验提升：自动播放、循环和内联播放打造丝滑的观看体验，封面图则让页面更美观。
- 性能优化：懒加载和高效编码减少页面加载时间和数据消耗，尤其适合移动端用户。

代码如下，适用于产品官网的演示视频。
```xml
<video
    poster="https://cdn-domain/homepage/enterprise-1.png" playsinline autoplay loop muted loading="lazy">
    <source data-src="https://cdn-domain/homepage/enterprise-1.av1.mp4"
        type="video/mp4; codecs=av01.0.05M.08" src="https://cdn-domain/homepage/enterprise-1.av1.mp4">
    <source data-src="https://cdn-domain/homepage/enterprise-1.hevc.mp4" type="video/mp4; codecs=hvc1"
        src="https://cdn-domain/homepage/enterprise-1.hevc.mp4">
    <source data-src="https://cdn-domain/homepage/enterprise-1.mp4" type="video/mp4"
        src="https://cdn-domain/homepage/enterprise-1.mp4"><noscript></noscript>
</video>
```

## ffmpeg 使用

### 生成缩略图 (封面)

使用视频第一帧做封面：
```shell
ffmpeg -i demo.mp4 -vframes 1 demo_thumbnail.png
```

### 音频处理

音频使用 AAC 编码，比特率从原始的 317 kb/s 降到了 128 kb/s (``-c:a aac -b:a 128k``)。使用 ``-movflags +faststart`` 参数把 moov atom（包含索引信息）移到文件开头，让视频可以边加载边播放。

### AV1 编码

加入了 ``-cpu-used 6`` 参数（数值越高越快，但质量可能下降），并指定 CRF (Constant Rate Factor) 为 30 来控制质量与体积的平衡 (``-crf 30``，数值越大体积越小，质量越低)。同时启用多线程 ``-threads 0`` (自动使用所有核心)。

```shell
ffmpeg -i demo.mp4 -c:v libaom-av1 -crf 30 -b:v 0 -cpu-used 6 -threads 0 -c:a aac -b:a 128k -movflags +faststart -strict -2 demo_av1_libaom.mp4
```

### HEVC 编码

使用硬件加速的话，速度快，但是输出文件较大。
```shell
ffmpeg -i demo.mp4 -c:v hevc_videotoolbox -b:v 4000k -tag:v hvc1 -threads 0 -c:a aac -b:a 128k -movflags +faststart demo_hevc.mp4
```

换为软件编码方案，速度尚可，文件大小小很多。
```shell
ffmpeg -i demo.mp4 -c:v libx265 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart -tag:v hvc1 demo_hevc.mp4
```

### H.264 编码

使用硬件编码，大小较大
```shell
ffmpeg -i demo.mp4 -c:v h264_videotoolbox -b:v 5000k -threads 0 -c:a aac -b:a 128k -movflags +faststart demo_h264.mp4
```

软编码方案，速度较慢（4~5x）
```shell
ffmpeg -i demo.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart demo_h264.mp4
```

最终使用的 HTML：

```xml
<video poster="demo_thumbnail.png" playsinline autoplay loop muted loading="lazy">
      <!-- 注意 source 顺序：最优最省流的放前面 -->
      <source src="demo_av1_libaom.mp4" type="video/mp4; codecs=av01.0.04M.08">
      <source src="demo_hevc.mp4" type="video/mp4; codecs=hvc1">
      <source src="demo_h264.mp4" type="video/mp4">
      <!-- Fallback 信息 -->
      <p class="fallback">抱歉，您的浏览器似乎不支持 HTML5 视频播放。推荐使用最新版 Chrome、Firefox 或 Safari 浏览器。</p>
</video>
```
