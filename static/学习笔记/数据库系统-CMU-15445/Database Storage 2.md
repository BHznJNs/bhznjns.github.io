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

When the page gets full, the DBMS writes it into disk and starts filling up the next page with records.
- All disk writes are sequential.
- On-disk pages are ##immutable##.

