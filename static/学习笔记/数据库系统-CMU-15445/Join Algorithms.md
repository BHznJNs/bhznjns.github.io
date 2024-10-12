# Join Algorithms

## Operation Output

>>> Early Materialization & Late Materialization
### Early Materialization

##定义##：在 {Early Materialization}(早期物化)中，数据库会在 JOIN 操作过程中尽早地将中间结果物化（即实际存储到临时表或内存中）。这意味着在完成部分 JOIN 步骤后，数据库会立即生成一个中间结果集，并将其存储下来。

##优点##：
- 可以减少后续操作中的计算量，因为一些数据已经被提前过滤或聚合了。
- 对于某些查询，可以提高性能，尤其是在 JOIN 后的数据集比原始表小很多的情况下。

##缺点##：
- 需要额外的存储空间来保存中间结果。
- 如果中间结果非常大，可能会导致大量的 I/O 操作，从而降低性能。
- 在某些情况下，可能会产生不必要的物化步骤，如果这些中间结果随后被大量过滤掉的话。

### Late Materialization

##定义##：在 {Late Materialization}(晚期物化)中，数据库会尽量延迟物化过程，直到 JOIN 操作的最后阶段才生成最终的结果集。这意味着在 JOIN 的过程中，尽可能保持数据流式处理，只在必要时才进行物化。

##优点##：
- 减少了中间结果的存储需求，节省了存储空间。
- 可以更有效地利用缓存，因为在整个 JOIN 过程中，数据可以一直保留在内存中而不必写入磁盘。
- 有助于优化器更好地选择执行计划，因为它可以看到完整的逻辑结构。

##缺点##：
- 如果 JOIN 操作非常复杂或者涉及的数据量非常大，流式处理可能会增加 CPU 的负担。
- 在某些情况下，可能需要多次扫描相同的表，这可能导致性能下降。
>>>

## Cost Analysis Criteria

Assume:
- M pages in table R, m tuples in R
- N pages in table S, n tuples in S

使用 IO 次数来衡量{开销}(cost)

### Join VS Cross-Product

##R⨝S## is the most common operation and thus must be carefully optimized.
##R×S## followed by a selection is inefficient because the cross-product is large.
There are many algorithms for reducing join cost, but no algorithm works well in all scenarios.

## Join Algorithms

### Nested Loop Join

对于数据量小的时候（比如内存可以完全容纳），直接使用嵌套循环进行 Join 操作的开销通常也可接受。

>>> Naive Nested Loop Join

Pseudo-code for R⨝S:
```
foreach tuple r ∈ R:  // outer table
 foreach tuple s ∈ S: // inner table
  if r and s match then emit
```

##Cost##: M + (m ∙ N)

> [note]
> 这里的开销计算以没有页缓存为前提。

这里将表 R 看做 outer table，S 看作 inner table。
这里的 M 由外层遍历产生，为遍历 R 的每一个 tuple，##需要 M 次##。
在读取 R 中的一个 page 之后，遍历其中的 tuple，对每个 tuple，都遍历一遍 S 中的每一个 tuple 进行比较。
遍历 S 中的 tuple 需要##进行 N 次 IO##，即需要读取 S 的每一个 page。
由于 R 中有 m 个 tuple，故需要##遍历 m 次## S 中的 tuple。

### Optimization

Example database:
- Table R: M = 1000, m = 100,000
- Table S: N = 500, n = 40,000
- 0.1 ms / IO

R as outer table, S as inner table:
$$M + (m \cdot N) = 1000 + (100000 \cdot 500) = 50,001,000\ IOs \approx 1.3\ hours$$

S as outer table, R as inner table:
$$N + (n \cdot M) = 500 + (40000 \cdot 1000) = 40,000,500\ IOs \approx 1.1\ hours$$

通过使用数据量更小的表作为 outer table，可以一定程度优化 Join 计算性能。
>>>

>>> Block Nested Loop Join

Pseudo code:
```
foreach block B_R ∈ R:
 foreach block B_S ∈ S:
  foreach tuple r ∈ B_R:
   foreach tuple s ∈ B_s:
    if r and s match then emit
```

##Cost##: M + (M ∙ N)

在 Nested Loop Join 中，对每个 outer table 中的 tuple 都遍历一遍 inner table。
在 Block Nested Loop Join 中，则变为对每个 outer table 中的 page 都遍历一遍 inner table，从而减少对 inner table 遍历的次数，减少总的 IO 次数。

和 Nested Loop Join 中相同，使用数据量更小的表作为 outer table。

### Optimization

假设{缓存池}(buffer page)中可以容纳 B 个 page。
- outer table 中的 page 使用 ##B - 2## 个 buffer page
- inner table 中的 page 使用 1 个 buffer page
- 计算结果使用 1 个 buffer page

Pseudo-code:
```
foreach B - 2 pages p_R ∈ R:
 foreach page p_S ∈ S:
  foreach tuple r ∈ B - 2 pages:
   foreach tuple s ∈ p_s:
    if r and s match then emit
```

##Cost##: $$M + (\lceil \cfrac{M}{B-2} \rceil \cdot N)$$

### 一种理想情况

如果缓存池中能够容纳 outer table，即 $$M \lt B - 2$$
##Cost##: M + N
>>>

>>> Index Nested Loop Join
Pseudo-code:
```
foreach tuple r ∈ R:
 foreach tuple s ∈ Index(r_i = s_j):
  if r and s match then emit
```

Assume the cost of each index probe is some constant ``C`` per tuple.
##Cost##: M + (m ∙ C)

> 注：对于一张表，比较常用的索引为 B+ 树
>>>

### Sort-Merge Join


