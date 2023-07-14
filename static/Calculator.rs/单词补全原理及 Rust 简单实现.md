# 单词补全原理及 Rust 简单实现

前注：本文的实现参考了此 Github 仓库: [rs-complete](https://github.com/Blightmud/rs-complete)

- - -

## 实现目标

先引用 rs-complete 项目 README 中的一段文字来说明本文的实现目标：

假如我们有一个词库（能看出该项目的作者挺喜欢蝙蝠侠的）

```javascript
[
    "batcave",
    "batman",
    "batmobile",
]
```

我们使用这个词库，以每个字母为节点，构建一颗树，如下所示：

```javascript
//                        'c' - 'a' - 'v' - 'e'
//                       /
//  root - 'b' - 'a' - 't' - 'm' - 'a' - 'n'
//                             \
//                              'o' - 'b' - 'i' - 'l' - 'e'
```

然后，我们使用单词片段``batm``进行查找，可以通过遍历这颗树来得到：

```javascript
[
    "an",
    "obile",
]
```

## 实现原理解释

### 单词插入

现在，让我们假设存在一颗空树，

```javascript
//  root - [empty]
```

我们需要插入一个单词``abcd``，由于当前树为空，我们可以很简单地遍历这个单词，将每一个字母新建节点，插入到树中。

```javascript
//  root - 'a' - 'b' - 'c' - 'd'
```

让我们再插入一个单词``befg``，步骤与之前插入单词类似，遍历这个单词，并插入到树中。

```javascript
//  对 "befg" 进行遍历
//  当前查找节点：root
//  - 'b' -> 在 root 的子节点中寻找 -> 不存在 -> 直接插入到 root -> 当前查找节点设为 'b'
//  - 'e' -> 在 'b' 的子节点中寻找 -> 不存在 -> 直接插入到 'b' -> 当前查找节点设为 'e'
//  - 'f' -> 以此类推
//  - 'g' -> 以此类推

//         'a' - 'b' - 'c' - 'd'
//        /
//  root -
//        \
//         'b' - 'e' - 'f' - 'g'
```

让我们再插入一个单词``abef``，步骤与之前插入单词类似，遍历这个单词，并插入到树中。

```javascript
//  对 "abef" 进行遍历
//  当前查找节点：root
//  - 'a' -> 在 root 的子节点中寻找 -> 存在 -> 当前查找节点设为 'a'
//  - 'b' -> 在 'a' 的子节点中寻找 -> 存在 -> 当前查找节点设为 'b'
//  - 'e' -> 在 'b' 的子节点中寻找 -> 不存在 -> 直接插入到 'b' -> 当前查找节点设为 'e'
//  - 'f' -> 在 'e' 的子节点中寻找 -> 不存在 -> 直接插入到 'e' -> 当前查找节点设为 'f'

//                     'c' - 'd'
//                    /
//         'a' - 'b' -
//        /           \
//  root -             'e' - 'f'
//        \
//         'b' - 'e' - 'f' - 'g'
```

### 使用单词片段查找

让我们复用上面的这棵树，尝试使用单词片段``ab``进行查找。

```javascript
//  对 "ab" 进行遍历
//  当前查找节点：root
//  - 'a' -> 在 root 的子节点中寻找 -> 存在 -> 当前查找节点设为 'a'
//  - 'b' -> 在 'a' 的子节点中寻找 -> 存在 -> 当前查找节点设为 'b'

//
//  当前查找节点 ---|
//                |    'c' - 'd'
//                |   /
//         'a' - 'b' -
//        /           \
//  root -             'e' - 'f'
//        \
//         'b' - 'e' - 'f' - 'g'
```

在对单词片段进行遍历后，我们得到了需要遍历的子树。

```javascript
//    'c' - 'd'
//   /
//  -
//   \
//    'e' - 'f'
```

对这棵子树进行遍历，我们就可以获得用来补全单词片段``ab``的字符串数组：

```javascript
[
    "cd",
    "ef",
]
```

- - -

## 代码实现

### 节点定义

```rust
pub struct CompleterNode {
    subnodes: BTreeMap<char, CompleterNode>,
}
```

注：由于我们是通过将单词拆分成单独的字母来作为节点进行存储，且字母本身是具有有序性的，因此在这里使用 TreeMap(BTreeMap in Rust) 的方式存储数据。

### 节点方法实现

#### 新建

```rust
use std::{collections::BTreeMap, str::Chars};

pub fn new() -> Self {
    Self {
        subnodes: BTreeMap::<char, CompleterNode>::new(),
    }
}
```

#### 插入

```rust
// `word` 是需要插入的目标单词
pub fn insert(&mut self, mut word: Chars) {
    match word.next() {
        Some(ch) => {
            let subnode = self.subnodes
                // 在当前节点的子节点中寻找 key 为 `ch` 的子节点
                .entry(ch)
                // 如果找得到目标节点，将其返回，
                // 如果找不到就插入 key 为 `ch` 的新节点，返回新节点。
                .or_insert(Self::new());

            // 在子节点中递归插入目标单词
            subnode.insert(word);
        }
        None => {
            // 在目标单词遍历完成后另外插入 key 为 '\0' 的空节点，原因见下文
            self.subnodes.insert(0 as char, Self::new());
        }
    }
}
```

#### 补全

```rust
// `word` 和 `result` 是从外部传入，见下文中对根节点的实现。
pub fn complete(&self, mut word: Chars, result: &mut Vec<String>) {
    match word.next() {
        // 遍历被查找单词片段

        Some(ch) => {
            if let Some(node) = self.subnodes.get(&ch) {
                node.complete(word, result)
                // 由于补全结果中不包含被查找单词片段，
                // 这里仅是遍历被查找单词片段，并在树中找到找到对应节点

                // 例如：
                //   被查找单词片段：
                //     "ab"
                //   当前树：
                //   root - 'a' - 'b' - 'c' - 'd'
                // 将会遍历至 'a' 对应的子节点，也就是 'b'，
                // 之后对 'b' 节点的处理就是 `None` 分支中的事了。
            }
        }
        None => {
            // 对自身所有子元素对应的子树进行遍历
            for (ch, subnode) in &self.subnodes {
                if *ch == '\0' { continue };
                subnode.collect(String::from(*ch), result);
            }

            // 例如：
            //   被查找单词片段：
            //     "ab"
            //   当前树：
            //                      'c' - 'd'
            //                     /
            //   root - 'a' - 'b' -
            //                     \
            //                      'e' - 'f'
            // 由上文可知，在 `Some` 分支中遍历到了 'b' 节点，而这里应是对 'b' 节点的处理。
            // 所以这里的 for 循环应是对 'b' 节点的两个子节点，'c' 与 'e' 两个节点进行 `collect` 操作。
        }
    }
}

fn collect(&self, partial: String, result: &mut Vec<String>) {
    // collect 操作即是对当前节点及其对应的子树进行遍历
    // `partial` 的初始内容便是当前节点自身的字母。

    // 承接上文 `complete` 中 `None` 分支中的例子：
    //   被查找单词片段：
    //     "ab"
    //   当前树：
    //                      'c' - 'd'
    //                     /
    //   root - 'a' - 'b' -
    //                     \
    //                      'e' - 'f'
    // 假设当前节点为 'c'，
    // 则当前的 `partial` 应为 String("c")。

    if self.subnodes.is_empty() {
        // 若无子节点
        result.push(partial)
    } else {
        // 遍历子节点，
        for (ch, subnode) in &self.subnodes {
            if *ch == '\0' {
                // 使用 '\0' 字符是为了防止树中同时存在一个单词和该单词的部分。
                // 例：
                //   当将 "abc" 与 "abcd" 同时插入到树中时，树的实际结构如下：
                //
                //   root - 'a' - 'b' - 'c' - 'd'
                //                           \
                //                            '\0'
                //   则当 'c' 节点执行 `collect` 时，会向 `result` 中 push
                //   两个元素："c", "cd"

                result.push(partial.clone())
            } else {
                // 例：
                // 假设树结构：
                //       'd'
                //      /
                // 'c' -
                //      \
                //       'e'
                // 当前节点为 'c'，
                // 则此处会让 'd' 节点使用 String("cd") 进行 collect；
                // 'e' 节点使用 String("ce") 进行 collect。

                let mut cloned = partial.clone();
                cloned.push(*ch);
                subnode.collect(cloned, result);
            }
        }
    }
}
```

### 根节点的定义及实现

这里只是对上文中节点方法的封装，就不过多阐述了。

```rust
pub struct Completer {
    root: CompleterNode,
}

impl Completer {
    pub fn new() -> Self {
        Self {
            root: CompleterNode::new(),
        }
    }

    pub fn insert(&mut self, word: &str) {
        self.root.insert(word.chars());
    }

    pub fn complete(&mut self, word: &str) -> Vec<String> {
        let mut result = Vec::<String>::new();
        self.root.complete(word.chars(), &mut result);
        return result;
    }
}
```

### 测试代码

```rust
extern crate completer;

use completer::Completer;

fn main() {
    let mut completer = Completer::new();
    completer.insert("ab");
    completer.insert("abc");
    completer.insert("abd");
    completer.insert("abe");
    completer.insert("abda");
    completer.insert("abea");

    let test = completer.complete("ab");
    println!("{:#?}", test);
}
```

结果：

```javascript
[
    "c",
    "d",
    "da",
    "e",
    "ea",
]
```

## 完整代码

```rust
use std::{collections::BTreeMap, str::Chars};

pub struct CompleterNode {
    subnodes: BTreeMap<char, CompleterNode>,
}

impl CompleterNode {
    pub fn new() -> Self {
        Self {
            subnodes: BTreeMap::<char, CompleterNode>::new(),
        }
    }

    pub fn insert(&mut self, mut word: Chars) {
        match word.next() {
            Some(ch) => {
                let subnode = self.subnodes.entry(ch).or_insert(Self::new());
                subnode.insert(word);
            }
            None => {
                self.subnodes.insert(0 as char, Self::new());
            }
        }
    }

    pub fn complete(&self, mut word: Chars, result: &mut Vec<String>) {
        match word.next() {
            Some(ch) => {
                if let Some(node) = self.subnodes.get(&ch) {
                    node.complete(word, result)
                }
            }
            None => {
                for (ch, subnode) in &self.subnodes {
                    if *ch == '\0' { continue };
                    subnode.collect(String::from(*ch), result);
                }
            }
        }
    }

    fn collect(&self, partial: String, result: &mut Vec<String>) {
        if self.subnodes.is_empty() {
            // no subnode
            result.push(partial)
        } else {
            for (ch, subnode) in &self.subnodes {
                if *ch == '\0' {
                    result.push(partial.clone())
                } else {
                    let mut cloned = partial.clone();
                    cloned.push(*ch);
                    subnode.collect(cloned, result);
                }
            }
        }
    }
}

pub struct Completer {
    root: CompleterNode,
}

impl Completer {
    pub fn new() -> Self {
        Self {
            root: CompleterNode::new(),
        }
    }
    pub fn insert(&mut self, word: &str) {
        self.root.insert(word.chars());
    }

    pub fn complete(&mut self, word: &str) -> Vec<String> {
        let mut result = Vec::<String>::new();
        self.root.complete(word.chars(), &mut result);
        return result;
    }
}
```
