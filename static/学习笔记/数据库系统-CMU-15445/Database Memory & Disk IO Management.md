# Database Memory & Disk IO Management

How the DBMS manages its memory and move data back-and-forth from disk.

Spatial Control:
- Where to write pages on disk.
- The goal is to keep pages that are used together often as physically close together as possible on disk.

Temporal Control:
- When to read pages into memory, and when to write them to disk.
- The goal is to minimize the number of stalls from having to read data from disk.

- - -

## Locks VS. Latches

简单来说,
Locks 处理的是数据库层面的并发问题，保证在多用户环境下对数据库中的逻辑结构（如表、行等）进行并发访问时的数据一致性；
Latches 处理的是数据库内部实现层面的并发问题，用来保护数据库内部的数据结构（如内存中的缓冲池、索引树节点等），避免在同一时间内被不同的内部线程或进程并发访问而导致的问题。

Locks:
- Protects the database's logical contents from other transactions.
- Held for transaction duration.
- Need to be able to rollback changes.
Latches:
- Protects the critical sections of the DBMS's internal data structure from other threads.
- Held for operation duration.
- Do not need to be able to rollback changes.

## Page Directory VS. Page Table

Page Directory is the mapping from ##page ids## to ##page locations in the database files##.
- All changes must be recorded on disk to allow the DBMS to find on restart.

Page Table is the mapping from ##page ids## to ##a copy of the page in buffer pool frames##.
- This is an in-memory data structure that does not need to be stored on disk.

## Buffer Pool

### Meta Data

- Dirty Flag
- Pin/Reference Counter
- Access Tracking Information

### Optimizations

#### Multiple Buffer Pools

使用多个缓存池有助于减少 Latches 对性能带来的影响。

>>> 在使用多个缓存池时，如何确定应该从哪个缓存池获取数据
Approach #1: Object Id
- Embed an object identifier in record ids and then maintain a mapping from objects to specific buffer pools.

Approach #2: Hashing
- Hash the page id to select whichbuffer pool to access.
>>>

#### Pre-Fetching

预测接下来可能要从硬盘读取的 Page，提前读取并缓存

- Sequential Scans
- Index Scans

#### {Scan Sharing}(共享查询)

例如：

```sql
SELECT SUM(val) FROM A;
SELECT AVG(val) FROM A;
```

上面两条指令都需要读取表 A。
在要开始执行第二条指令时，第一条指令正在执行。则两条查询可以共享指针，待第一条指令查询完成后，第二条指令的指针再进行剩余条目的查询。

#### Buffer Pool Bypass

在连续扫描硬盘数据时，选择不将从硬盘读到的数据缓存以减少开销

- Memory is local to running query.
- Works well if operator needs to read a large sequence of pages that are contiguous on disk.
- Can also be used for temporary data (sorting, joins).

### Buffer Replacement

#### Least-Recently Used (LRU)

维护每个 Page 最后被访问的时间戳，当需要将一个 Page 清出缓存时，将时间戳最小的 Page 清除。

#### Clock (Second Chance Replacement, SCR)

Clock 算法不需要使用时间戳，而是维护一个循环链表，每一个链表节点对应一个 Page，每一个节点都有一个{引用位}(reference bit)。
当一个 Page 被访问时，它的引用位会被置为 1。当需要淘汰一个 Page 时，算法会从队列的某个位置开始扫描，寻找第一个引用位为 0 的 Page。如果找到这样的 Page，则将其作为淘汰的候选者。如果一轮扫描下来没有找到引用位为 0 的 Page，则这一轮扫描结束时会将所有 Page 的访问位重置为 0，然后从头开始新的一轮扫描。

Clock 算法正如其名字中的 “Second”，其会优先移除缓存中没有被二次使用的 Page 以尽量使复用率高的 Page 留在缓存中。

##### LRU 和 Clock 的缺点

LRU + Clock only tracks when a page was last accessed, but not how often a page is accessed.

Sequential Flooding

#### 更优的替换方案：LRU-K

追踪对一个 Page 的最后 K 次访问（通常使用 K=2），优先清除缓存中被访问次数小于 K 的 Page。

#### Dirty Page

对于在缓存中的 Page，要将其 Evict，有两种情况

1. 未被修改的 Page，可直接 Evict。
2. 被写入过的 Page，即 dirty page，需要将其内容写入到磁盘后再 Evict。

#### Background Writing

用单独的线程，周期性扫描所有 Page，并将 dirty page 写入磁盘。

### {直接读写}(Direct I/O)

使用直接读写来绕过操作系统的 Page 缓存机制，实现对数据持久化的完全控制。
