# 一个中文 ASR 的综合最佳解决方案

在写完[上一篇博客](./Whisper%20模型中文调优.md)后，我又对中文特化训练的 ASR 模型进行了调研，发现能打的基本就两个，一个是 [Paraformer-large](https://huggingface.co/funasr/Paraformer-large) 模型，另一个是 [SenseVoiceSmall](https://huggingface.co/FunAudioLLM/SenseVoiceSmall)。

Paraformer 模型我没有测试过，不过按着用新不用旧的原则，SenseVoice 应该会更好用一点 🐶

SenseVoice 的官方部署引导是需要依赖 pytorch 来运行的，但是有过 Python 程序打包部署的朋友应该知道，只要程序依赖 pytorch 这个东西，打包结果就不可能少于 1G 的大小。于是我查询了一些不需要 pytorch 运行 SenseVoice 的方法，最后发现有两个可行的途径。

一个是借助 sherpa-onnx，需要使用专门转换后的模型来运行，代码可以参考我的[这个示例](https://gist.github.com/BHznJNs/766cef99f190ceb777d585bc6e758618)。
另一个就是本文的主角，[SenseVoice.cpp](https://github.com/lovemefan/SenseVoice.cpp) 了。

## SenseVoice.cpp 是什么？

类似于 [whisper.cpp](https://github.com/ggml-org/whisper.cpp)，SenseVoice 也是通过将原始模型 port 到 CPP 的方式实现相比于原始模型没有明显的性能下降的同时，对于部署设备的性能要求大幅下降的。
我在自己的设备上的测试结果是，原始的 SenseVoice 通过 sherpa-onnx 运行，需要 2G 左右的内存占用，而使用 SenseVoice.cpp 配合 fp16 的模型，只需要 500M 作用的内存即可运行。同时，由于是 CPP 程序，可移植性也更强。

但是，在我尝试把 SenseVoice.cpp 接入到自己的项目中时，却遇到一个小问题，就是 SenseVoice.cpp 目前的调用方式只允许一次性调用，即传入音频文件路径，程序返回转录结果，执行完成。如果项目中需要持续进行转录，这样的调用方式就会导致大量的时间耗费在创建子进程和模型加载上。

于是我稍微对 SenseVoice.cpp 进行了[二次开发](https://github.com/BHznJNs/SenseVoice.cpp-repl)，将其改成了一个 REPL 程序，使其能够与其它程序通过标准输入输出进行通信。我也给这个项目编写了一份[Python 版本的调用示例](https://github.com/BHznJNs/SenseVoice.cpp-repl/blob/main/examples/python-invocation-usage.py)，实际使用时可以从这个示例出发进行修改，或者使用 AI 翻译成其它语言的版本。
