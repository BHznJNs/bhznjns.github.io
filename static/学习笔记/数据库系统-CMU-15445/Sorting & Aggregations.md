# Sorting & Aggregations

## In memory sorting

当内存中有足够的空间容纳数据时，可以使用类似于快速排序的内存内排序方式；反之，我们要使用一些基于硬盘的排序方式。

- - -

## Top-N Heap Sort

假设有下面这样一段 SQL 查询：

```sql
SELECT * FROM enrolled 
  ORDER BY sid
FETCH FIRST 4 ROWS
  WITH TIES
```

>>> 这段 SQL 的作用
这条 SQL 语句的具体行为如下：

1. 从 enrolled 表中选择所有列。
2. 根据 sid 列对结果集进行升序排序。
3. 取出排序后最前面的 4 行记录。
4. 如果第 4 行与后续的某些行在 sid 列上具有相同的值，则将这些具有相同sid值的所有行都包括进来，而不只是限于最初的 4 行。
>>>

由于这段 SQL 限制只返回四行数据，在排序时可以使用大根堆；
在遍历数据时，如果当前元素比堆的根要大且堆中元素大于等于四，则直接跳过该元素。

## External Merge Sort

将大量数据分成多个区块，使得在内存中可以容纳其中几份。
将每个区块逐一读入内存，使用内存排序算法对其进行排序后，再将其写回硬盘。
将所有区块两两合并成更大的区块。

### 2-Way External Merge Sort

>>> 一个示例
### 条件
- “2”是每一次合并使用的区块数量。
- 数据被分成 N 个区块
- 缓存池中能容纳 B 个区块

假设有下面数个区块需要排序

```
| 3,4 | 6,2 | 9,4 | 8,7 | 5,6 | 3,1 | 2 |
```

预处理，对每个区块进行单独排序

```
| 3,4 | 2,6 | 4,9 | 7,8 | 5,6 | 1,3 | 2 |
```

开始两两合并

```
| 2,3 | | 4,7 | | 1,3 | | 2 |
| 4,6 | | 8,9 | | 5,6 |
```

```
| 4,4 | | 1,2 |
| 6,7 | | 3,5 |
| 8,9 | | 6   |
| 2,3 |
```

```
| 1,2 |
| 2,3 |
| 3,4 |
| 4,5 |
| 6,6 |
| 7,8 |
| 9   |
```
>>>

### Double Buffering Optimization

提前将下一个要用到的区块在后台读到内存中，以减少每一步的 IO 等待时间。
当你有足够的内存用于存储更多区块时，你可以使用更多路的 External Merge Sort，也可以将部分内存用于预加载更多区块。

### Comparison Optimizations

Approach #1: Code Specialization
通常情况下，排序算法会接受一个比较函数作为参数，该函数定义了如何比较两个元素。但是，如果数据类型是已知的并且固定不变，可以预先编写针对这种类型的高效比较逻辑，并直接嵌入到排序算法中。这样做的好处是可以避免函数调用的开销，并且可以利用编译器对特定类型的优化。

Approach #2: Suffix Truncation
在比较两个长字符串时，先取出每个字符串的前几个字节（即二进制前缀），然后快速比较这些前缀。如果前缀不同，那么可以直接确定哪个字符串应该排在前面；如果前缀相同，则需要回退到传统的、较慢的完整字符串比较方法来决定最终顺序。

### Using B+ Trees For Sorting

#### Clustered B+ Tree

即指数据行直接存储在B+树的叶子节点中，而不是单独存放。
这种情况下，由于 B+ 树中数据已经是有序的，可以直接进行顺序读取获得结果。

#### Unclustered B+ Tree

即数据行并不存储在B+树的叶子节点中，而是叶子节点只包含指向实际数据行位置的指针。
这种情况下，读取实际数据会变为随机读取，对缓存不友好，IO 性能较低。

## Aggregrations

很多聚合操作能通过排序解决，如 ``DISTINCT``，你能通过将数据排序后，在输出数据时对重复数据进行跳过（因为在排序后，重复数据会紧挨在一起）来移除重复项。

### Alternatives to Sorting

一些时候，用户不需要输出的数据被排序，这种时候，哈希算法是更好的选择。
- Only need to remove duplicates, no need for ordering
- Can be computationally cheaper than sorting

### External Hashing Aggregate

#### Phase#1 - Partition

使用哈希函数 ``h,,1,,`` 将数据分成多个{部分}(partition)，将键的哈希值相同的数据放到同一个部分中。
Assume that we have B buffers.
We will use B-1 buffers for the partitions and 1 buffer for the input data.

#### Phase#2 - Rehash

使用哈希函数 ``h,,2,,`` 创建另一个哈希表，将上面产生的部分逐一遍历，存入到新的哈希表中，这个过程中重复项会被去除。

#### Hashing Summarization

在重新哈希阶段，维护一个内存中的哈希表，其中存储的是形如 (GroupKey → RunningVal) 的键值对，这里的 GroupKey 是用来标识不同组别的键，而 RunningVal 则是该组的当前聚合值（例如累加的总和）。

```sql
SELECT cid, AVG(s.gpa)
  FROM student AS s, enrolled AS e
 WHERE s.sid = e.sid
 GROUP BY cid
```
