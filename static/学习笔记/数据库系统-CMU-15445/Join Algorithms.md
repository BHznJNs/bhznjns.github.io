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
