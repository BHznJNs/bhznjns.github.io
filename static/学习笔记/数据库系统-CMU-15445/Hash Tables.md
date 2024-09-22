# Hash Tables

Execution engine with two data structures:
1. Hash Tables (Unordered)
2. Trees (Ordered)

- - -

## Hash Table

A ##hash table## implements an unordered associative array that maps keys to values.
It uses a ##hash function## to compute an offset into this array for a given key, from which the desired value can be found.

Space Complexity: O(n)
Time Complexity:
- Average: O(1)
- Worst: O(n)

### Hash Function

For any input key, return an integer representation of that key.

- No encryption
- fast and has a low collision rate

### Static Hashing Scheme

{“静态”}(static)意味着哈希表使用的内存大小固定

#### Linear Probe Hashing

使用一个大 slot 数组用于存储

在##插入键值对##时，对键做哈希运算找到插入的 slot，
- 如果目标 slot 为空，直接插入
- 如果目标 slot 不为空，顺序查找到下一个为空的 slot，进行插入

当数组满时，创建更大的内存，进行 rehash

在##删除键值对##时，有两种方式：
1. Movement: Rehash keys until you find the first empty slot. (Expensive)
2. {Tombstone}(墓碑): 在删除一个键值对后，在其 slot 处留下一个标记
  - Get 查找时遇到标记会查找之后的 slot
  - 插入元素时遇到标记会复用 slot

##Non-unique Keys## 一些时候会需要让一个键对应多个值，有两种方法实现：

1. ##Separate Linked List##: 对每个键使用单独的链表存储对应的值
2. ##Redundant Keys##: 将同一个键和多个值组成的多个键值对都直接存在表中

##### Optimizations

- Specialized hash table implementations based on key type(s) and sizes.
  - Maintain multiple hash tables for different string sizes for a set of keys.
- Store metadata separate in a separate array.
  - Packed bitmap tracks whether a slot is empty/tombstone.
- Use table + slot versioning metadata to quickly invalidate all entries in the hash table.
  - If table version does not match slot version, then treat the slot as empty.

#### Cuckoo Hashing

在插入、查询和删除键值对时，使用多个哈希函数计算键对应的哈希值，从而向多个 slot 进行操作。
在插入时，对于多个 slot，使用其中空的 slot；如果所有的 slot 都有值，则进行 rehash。
在查找和删除时只需对多个时间复杂度为 ``O(1)``，

### Dynamic Hashing Scheme

静态哈希表需要在使用前预先知道要存储的元素数量，否则需要在运行时重新分配更大的空间重新构建哈希表（耗时）。

而动态哈希表可以按需分配空间。

#### Chained Hashing

维护一个{桶链表}(linked list of buckets)，将每个哈希值相同的键值对存到同一个桶中，在查找时，在哈希值对应的桶中进行线性查找。
插入和删除操作与查找操作类似。

#### Bloom Filters

维护一个 bitmap，
在插入键值对时，使用多个哈希函数计算多个键的哈希值，将每个哈希值在 bitmap 中的对应位设为 1
在查找键值对时，使用同样的几个哈希函数计算哈希值，在 bitmap 中查询每个哈希值对应位，如果每个位都为 1 则存在

- 会出现“假阳”，即查询结果为存在但并没有插入过
- 无法实现删除操作

#### Extendible Hashing

结合了 Chained Hashing 和哈希表拓展的哈希表实现

讲解视频（B 站）
@[可拓展哈希/可拓展散列/Extendible Hashing](https://player.bilibili.com/player.html?isOutside=true&aid=112836206398366&bvid=BV1Bd8ieKERa&cid=500001625019304&p=1)

讲解视频（油管）
@[Extendible Hashing - Exercise - Data Structures](https://www.youtube.com/embed/Bxfo2LwOIj4?si=cTJ0iEmJP54Z5KH9)

#### Linear Hashing

讲解视频（油管）
@[Linear Hashing - Exercise - Data Structures](https://www.youtube.com/embed/HA-il9jV7D0?si=gPxeAnhu0W4IlaU0)
