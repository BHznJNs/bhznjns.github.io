# Database Storage (1)

The DBMS assumes that the ##primary storage location## of the database is on ##non-volatile disk##.

## Storage Hierarchy

##Volatile## Random access byte-addressable
- CPU Registers
- CPU Caches
- DRAM

- - -
##Non-Volatile## Sequential access block-addressable
- SSD
- HDD
- Network Storage

## Memory Mapped I/O Problems

### {事物安全性}(Transaction Safety)

OS can flush dirty pages at any time
数据在内存中经过修改，但还未实际写入硬盘时，数据即为脏数据。而操作系统将内存中的脏数据写入硬盘的时机是不可控的，可能造成程序错误和崩溃。

### {输入/输出停滞}(I/O Stalls)

DBMS doesn't know which pages are in memory. The OS will stall a thread on page fault.

### {错误处理}(Error Handling)

Difficult to validate pages. Any access can cause a SIGBUS that the DBMS must handle.

### {性能问题}(Performance Issues)

OS data structure contention. TLB shootdowns.

## File Storage

DBMS stores a database as ##one or more files## on disk typically in a ##{proprietary}(专有的) format##.

### Storage Manager

Responsible for maintaining a database's files.

> Some do their own scheduling for reads and writes to improve spatial and temporal locality of pages.

Organizes the files as a collection of pages.
> Tracks data read/written to pages.
> Tracks the available space.

### Database Pages

A page is a ##fixed-size## block of data.

Each page is given a unique identifier.

Three different notions of 
"pages" in a DBMS:
- Hardware Page (usually 4KB)
- OS Page (usually 4KB)
- ##Database Page (512B-16KB)##