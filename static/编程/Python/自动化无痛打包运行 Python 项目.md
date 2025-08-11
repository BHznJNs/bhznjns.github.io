# 自动化无痛打包运行 Python 项目

之前在做[狸语字幕助手](https://apps.microsoft.com/detail/9pfldtv29jfv)这个项目时，最开始用的库中带有 PyTorch 依赖，而这个依赖又是出了名的大，导致要打包部署项目时特别费劲，我用传统的 PyInstaller、Nuitka 这两个打包方案试了一天都没成功。

于是我想起了之前看到的 [PyStand](https://github.com/skywind3000/PyStand/) 这个项目。这个项目通过提供一个可执行文件，调用打包部署后的目录下的 Python Embedded 解释器来运行项目。

这个项目相比于传统的打包方式的区别如下：
优点：
1. 在面对 pytorch 这样的巨型依赖时不会处理不动
2. 引入所需要进行的修改更少，通用性更强，只需要额外提供一个作为入口的 Python 模块文件

同时缺点也很明显：
1. 需要自行手动构建
2. 打包后只支持在 Windows 上运行

我在狸语这个项目中使用了这个项目并配置了 GitHub Actions 来实现自动化打包，为了方便在其它项目中复用，我将这个流程封装成了一个单独的 GitHub Actions，你可以在[这里](https://github.com/marketplace/actions/build-python-application-standalone-package)找到这个 Action。

具体的用法就像这样：
```yaml
jobs:
  build:
    runs-on: windows-latest
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build Python Application Standalone Package
        id: pystand-build
        uses: BHznJNs/pystand-build@release-6
        with:
          application-name: "YourApplicationName" # 项目名称
          python-version: "3.11.9" # 项目使用的 Python 版本
          requirements-path: "backend/requirements.txt" # 你的 requirements.txt 文件的路径
          pystand-entry-file: "PyStand.py" # 对于 PyStand 的入口文件
          included-files: |
            backend/ # Python 源代码目录
            # 其它资源文件目录

      - name: Create Zip Archive
        shell: bash
        run: |
          build_path="${{ steps.pystand-build.outputs.build-directory }}"
          (cd "$build_path" && 7z a -tzip "$RUNNER_TEMP/YourApplicationName.zip" .)

      # upload package with `${{ runner.temp }}/YourApplicationName.zip`
```

对于项目本身几乎不需要进行修改，只需新建一个面向 PyStand 的 Python 入口模块，再引入这个 action 即可。
