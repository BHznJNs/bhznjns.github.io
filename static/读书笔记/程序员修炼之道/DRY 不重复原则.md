# {DRY}(Don't Repeat Yourself) 不重复原则

> 在一个系统中，每一处知识都必须单一、明确、权威地表达。

这与我在博客[我的编程技巧总结](博客收藏/我的编程技巧总结.md)中记录的“在所有地方使用同一个称呼”有异曲同工之妙，不过这里的不重复不止针对源代码，而是“不在两个或更多地方表达相同的东西”。

> DRY 针对的是你对知识和意图的复制。它强调的是，在两个地方表达的东西其实是相同的，只是表达方式有可能完全不同。

## 文档中的重复

>>> 第一个例子
看看下面这一段代码：

```rust
// 格式化输出 “1 + 2” 的结果
println!("{}", 1 + 2);
```

就是很明显的重复。这段代码中的注释直接描述了代码的作用，使得这段代码的意图实际被描述了两次。一旦代码本身需要变更，我们就必须更新两个地方。几乎可以肯定，用不了多久，注释和代码就会变得不同步。
>>>

## 并非所有的代码重复都是知识的重复

>>> 第二个例子
看看下面这一段代码：

```python
def vatidate_age(value):
    validate_type(value, int)
    validate_min_integer(value, 0)

def validate_quantity(value):
    validate_type(value, int)
    validate_min_integer(value, 0)
```

在这段代码中，虽然有两个内部逻辑几乎相同的函数，但这并不是重复。

> 这两个函数校验了两个不相干的东西，只是恰巧使用了相同的规则。这是一个巧合，而非重复。

事实上，由于这两个函数的校验对象不同，很可能随着业务的发展，对这两个校验对象需要使用完全不同的校验规则。如果都用同样一个函数来消除重复的话反而会增加日后的工作量。
>>>

## 数据中的重复

>>> 第三个例子
看看下面这一段代码：

```cpp
class Line {
public:
    Point start;
    Point end;
    double length;
};
```

乍一看，这个类貌似挺有道理。一条线段有起点和终点，而且一定有长度（即使长度为零）。不过这里出现了重复。长度是由起点及终点定义出来的：改变一个端点必然引起长度的变化。最好是把长度定义为一个通过计算得到的字段：

```cpp
class Line {
public:
    Point start;
    Point end;
    double Length() {
        return this->start.DistanceTo(this->end);
    }
};
```
>>>

但有的时候，你可能会因为性能原因而选择违背 DRY 原则。比如例子三中，如果计算两点间的距离的运算具有非常大的开销，你就需要缓存计算结果以减少重复计算带来的性能问题。

> 这里的技巧可以将负面影响限制在局部。违背的部分不会被暴露到外部世界：只有类里面的方法才用担心相关行为的正确性。

```cpp
class Line {
public:
    Point GetStart() { return this->start_; }
    Point GetEnd()   { return this->end_;   }

    void SetStart(Point new_start) {
        this->start_ = new_start;
        this->ResetLength();
    }
    void SetStart(Point new_end) {
        this->end_ = new_end;
        this->ResetLength();
    }

    double GetLength() {
        return this->length_;
    }

private:
    Point start_;
    Point end_;
    double length_;
    void ResetLength() {
        this->length_ = this->start_.DistanceTo(this->end);
    }
};
```

> 这个例子也阐明了一个重要的问题：无论什么时候，只要模块暴露出数据结构，就意味着，所有使用这个数据结构的代码和模块的实现产生了耦合。但凡有可能，都应采用一组访问器函数来读写对象的属性。如果未来需要增加功能，这样做能让事情更容易一些。
> 这个访问器函数的用法与Meyer的“统一访问”原则一致。该原则记录在《面向对象软件构造》一书中，它是这样说的：
> 一个模块提供的所有服务都应该通过统一的约定来提供，该约定不应表露出其内部实现是基于储存还是基于运算的
