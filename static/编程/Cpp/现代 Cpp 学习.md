# 现代 Cpp 学习

鉴于课程 15-445 Database System 使用的教学用数据库 bustub 使用 Cpp 编写，且现代数据库使用 Cpp 作为主开发语言较多，因此我认为学习现代 Cpp 对于转入数据库开发领域来说还是很重要的。

## 学习资料

我一开始采用完全自学的方式，bustub 中用到什么就现查，但是这种方式学习效率并不高。

我后来发现 15-445 课程中有一个学习现代 Cpp 的 [repo](https://github.com/cmu-db/15445-bootcamp)，其中基本涵盖入门现代 Cpp 所需的基础知识：

- 命名空间
- 引用（左值引用、右值引用）
- auto 关键字
- 迭代器
- 智能指针
  - unique_ptr
  - shared_ptr
- 移动语义和移动构造函数
- STL
  - vector
  - set
  - unordered_map
- 包裹类（RALL）
- 函数模版和类模板
- 多线程处理
  - mutex
  - rwlock
    - shared_lock(multiple read)
    - unique_lock(single write)
  - scoped_lock
