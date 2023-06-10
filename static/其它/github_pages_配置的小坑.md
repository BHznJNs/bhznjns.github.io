# Github Pages 配置的一个小坑

众所周知，``Github Page`` 默认是使用 [jekyll](https://jekyllcn.com/docs/home/) 来构建静态站点的，但对于不使用 jekyll 的用户来说，可能会因此遇到一些小坑，比如我今天遇到的这个: 无法访问以 ``.`` 号开头的文件/文件夹。

这是 Github 的默认配置导致的，详见此文: [Github Pages 与 jekyll](https://docs.github.com/zh/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)。

> 默认情况下，Jekyll 不会构建以下文件或文件夹：位于名为 /node_modules 或 /vendor 的文件夹中 | 以 ``\_`` ``.`` 或 ``\#`` 开头 | 以 ``~`` 结尾

那么解决方法也很简单，在网站的根目录下创建文件 ``.nojekyll`` 即可。
