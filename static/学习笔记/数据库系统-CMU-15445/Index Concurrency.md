# Index Concurrency

## Latch Modes

##Read Mode##
- Multiple threads can read the same object at the same time.
- A thread can acquire the read latch if another thread has it in read mode.

##Write Mode##
- Only one thread can access the object.
- A thread cannot acquire a write latch if another thread has it in any mode.

## Latch Implementations

### Test-and-Set Spin Latch (TAS)

使用一个 atomic 的值表示锁，在请求锁时尝试更改该值，若以被锁上则循环等待直到其它线程解锁。

- Very efficient (single instruction to latch/unlatch)
- Non-scalable, not cache friendly, not OS friendly.

```cpp
std::atomic<bool> latch;
// ...
while (latch.test_and_set(…)) {
 // Retry? Yield? Abort?
}
```

### Blocking OS Mutex

- Simple to use
- Non-scalable (about 25ns per lock/unlock invocation)
- Example: ``std::mutex``, ``pthread_mutex``, ``futex``

会 fallback 到内核中的 mutex，较慢

```cpp
std::mutex m;
// ...
m.lock();
// Do something special...
m.unlock();
```

### Reader-Writer Latches

- Allows for concurrent readers. Must manage read/write queues to avoid starvation.
- Can be implemented on top of spinlocks.
- Example: ``std::shared_mutex``, ``pthread_rwlock``

- - -

## Hash Table Latching

### Page Latches

### Slot Latches

- - -

## B+ Tree Concurrency Control

Two types of problems:
- Threads trying to ##modify## the contents of a node at the same time.
- One thread ##traversing## the tree ##while## another thread ##splits/merges## nodes.

### Latch Crabbing / Coupling

定义“安全”的节点：更新时不进行分裂和合并的节点
- Not full (on insertion)
- More than half-full (on deletion)

为了让 B+ 树能被多个线程同时进行访问和修改，在访问节点时，在访问过程中将根节点到目标节点上所有节点进行上锁，只有当遍历到“安全”的节点时，才能释放其祖先节点的锁。

##Find##: Start at root and traverse down the tree:
- Acquire R latch on child,→ Then unlatch parent.
- Repeat until we reach the leaf node.

##Insert / Delete##: Start at root and go down, obtaining W latches as needed. Once child is latched, check if it is safe:
- If child is safe, release all latches on ancestors

#### Better Latching Algorithm

由于上面的方法在对 B+ 树进行修改操作时必须对根节点以及部分内部节点上锁，在性能上有所不足。
多数对 B+ 树的修改都不会造成分裂或合并，可以先假设修改操作不会造成分裂或合并，在遍历树时使用读锁。如果遍历发现这次修改操作确实需要进行分裂或合并，再使用上面的方法（即使用写锁）重新遍历并更新。

This approach optimistically assumes that only leaf node will be modified; if not, R latches set on the first pass to leaf are wasteful.
- Set latches as if for search, get to leaf, and set W latch on leaf.
- If leaf is not safe, release all latches, and restart thread using previous insert/delete protocol with write latches.

#### 叶子节点间的并发

在只进行读操作时，无需特殊操作。

当一个线程要读取兄弟节点，而另一个线程正在写入该兄弟节点时，可以选择在经过几次获取锁的尝试后 kill 读取线程。
