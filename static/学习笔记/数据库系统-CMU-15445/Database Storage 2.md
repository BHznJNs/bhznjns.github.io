# Database Storage (2)

### Potential problems with the slotted page design

- Fragmentation
- Useless Dist I/O
- Random Disk I/O

## Log-Structured Storage

使用日志记录的方式保存对 tuple 的修改（通常有两种修改方式 ``PUT`` 和 ``DELETE``），新的记录只需附加在日志文件末尾而无需查询先前的记录。

- 每条记录必须包含要修改的 tuple 的标识符
- PUT 操作的记录要包含 tuple 内容
- DELETE 操作把 tuple 标记为被删除

- - -

当一页写满时，DBMS 会将其写入硬盘并开始写入下一页，从而减少硬盘读写次数
- All disk writes are sequential.
- On-disk pages are ##immutable##.

- - -

要从一个给定的 tuple id 查询对应的数据，DBSM 会以从新到旧的顺序查询日志，这可能会耗费很长时间并且要对硬盘进行多次读取。

在内存中维护一个索引，这个索引能够将 tuple id 映射到对应最新的那条日志记录
- If log record is in-memory, just read it.
- If log record is on a disk page, retrieve it.
- We will discuss indexes in two weeks.

### Compaction

通过串联数个日志文件中的记录，移除其中不需要的记录，组成新的日志文件。

对于每个 tuple id 对应的日志记录，只需保存最新的一条，这可以减少日志占用的硬盘空间，实现 compaction。

在实现 compaction 后，可以将剩余的记录按照 tuple id 排序，以提升查询效率（Time order to Tuple Id order）。

实现例子：__Sorted String Tables__(SSTables) 在如下数据库中

Universal Compaction(rocksdb) Level Compaction(leveldb)

### Downsides

- Write-Amplification
- Compaction is Expensive

## Tuple Storage

##INTEGER##/##BIGINT##/##SMALLINT##/##TINYINT##
- C/C++ Representation
##FLOAT##/##REAL## vs. ##NUMERIC##/##DECIMAL##
- IEEE-754 Standard / Fixed-point Decimals
##VARCHAR##/##VARBINARY##/##TEXT##/##BLOB##(variable length)
- Header with length, followed by data bytes.
- Need to worry about collations / sorting.
##TIME##/##DATE##/##TIMESTAMP##
- 32/64-bit integer of (micro)seconds since Unix epoch

### Large Values

通常，一个 tuple 的大小不能大于单个页的大小。
对于一些大于单页大小限制的数据，DBMS 会使用{溢出}(Overflow)存储页存储该数据，在原来的页本该存储该数据的位置会留下说明该溢出页存储位置的数据。
- Postgres: TOAST (>2KB)
- MySQL: Overflow (>½ size of page)
- SQL Server: Overflow (>size of page)

### External Value Storage

当需要在数据库中存入大量文本，图片、视频、音频等多媒体文件，二进制文件如 PDF 文件、Excel 表格等时，可以使用{外部值存储}(External Value Storage)。
- 向字段中存入指向另外硬盘文件或位于远程服务器上文件的引用（通常为 URI/URL）而不是直接存入数据
- 当需要读数据时，从数据库获取文件引用再对文件进行读取
- DBSM 通常无法操作外部文件
    - No durability protections『
    - No transaction protections『

### System Catalogs

Stores meta-data about databases
- Tables, columns, indexes, views
- Users, permissions
- Internal statistics

#### Access Table Schema

```sql
-- Postgres
\d;
```

```sql
-- MySQL
SHOW TABLES;
```

```sql
-- SQLite
.tables
```
