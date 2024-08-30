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

## Storage Architecture

- Heap File Organization
- Tree File Organization
- Sequential / Sorted File Organization (ISAM)
- Hashing File Organization

### Heap FIle

A heap file is an ##unordered## collection of pages with tuples that are stored ##in random order##.
- Create / Get / Write / Delete Page
- Must also support iterating over all pages.

#### Page Directory

The DBMS maintains special pages that tracks the location of data pages in the database files, which are called ##directory pages##. DBMS must make sure that the directory pages are in sync with the data pages.

The directory also records meta-data about available space:
- The number of free slots per page.
- List of free / empty pages.

## Page Layout

### Page Header

- Page Size
- Checksum
- DBMS Version (The DBMS version when the page created)
- Transaction Visibility
- Compression Information

> Some systems require pages to be self-contained (e.g., Oracle).

### Data Organizing

Two approaches:
- Tuple-oriented ← This Class
- Log-structured ← Next Class

#### Tuple Storage

How to store tuples in a page?

##Strawman Idea##: Keep track of the number of tuples in a page and then just append a new tuple to the end.

This is a bad idea:
- What happens if we delete a tuple?
- What happens if we have a variable-length attribute?

#### Slotted Pages

使用占用空间相同（可以以常数时间复杂度索引）的 slot 存储实际存储数据的 tuple 的位置（字节偏移量）。

#### Record IDs

每个 tuple 都会被分配一个独特的 __record identifier__，DBSM 以此区分 tuple

- 常见的 ID: ##page_id## + ##offset / slot##
- Can also contain file location info

## Tuple Layout

A tuple is essentially a sequence of bytes.
It's the job of the DBMS to ##interpret those bytes into attribute types and values##.

### Tuple Header

Where contains meta-data about the tuple
- Visibility info (concurrency control)
- Bit Map for NULL values.

> Header 中无需存储 tuple 中所使用的字段。
> We do not need to store meta-data about the schema.

### Tuple Data

#### Denormalized

通过将多张有关联的表的 tuple 存在同一 page 上以提升 I/O 性能
会造成更高的数据更新开销
