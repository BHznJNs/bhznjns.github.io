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

#### Cuckoo Hashing



### Dynamic Hashing Scheme


