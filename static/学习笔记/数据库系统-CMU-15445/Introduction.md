# Introduction

## 为什么要使用数据库？

如果使用普通的文件文件存储数据，以 CSV 文件格式为例，

- 要读取某一特定条目的时间复杂度为 ``O(n)``
- 数据间没有关联，如果需要删除一条数据，如一个用户，无法同时删除与该用户有关的数据
- CSV 读写不具备数据合法性校验的功能，如一条数据表示年份，但是它实际可以存储任意的字符串。
- 并发支持
- ...

## Database Management System (DBMS)

A software pieces that allow you to store, analyze and manipulate data in a database. 

- make sure your data is safe

### Data Models

A //data model// is a collection of concepts for ##describing the data in a database##.

A //schema// is a description of a particular collection of data with a given data model.

Most:
- Relational
NoSQL:
- Key / value
- Graph
- Document / Object
- Wide-Column / Column-family
Machine Learning:
- Array / Matrix/ Vectors
Obsolete / Legacy:
- Hierarchical
- Network
- Multi-Value

- - -

## Relational Model

Key tenets:
- Store database in simple data structures (relations)
- {实际的数据存储由数据库系统实现，脱离数据模型}(Physical storage left up to the DBMS implementation)
- {数据访问使用高级语言，数据库系统负责保证性能}(Access data through high-level language, DBMS figureout best execution strategy)

### relation

即常说的{表}(Table)

### {元组}(Tuple)

即表中的一行数据

### {主键}(Primary Keys)

表中对每一个元组的##唯一##标识符

### {外键}(Foreign Keys)

在一个表中用于关联另一个表中数据的键

## Relational Algebra

Relational algebra operators:
- Select
- Projection
- Union
- Intersection
- Difference
- Product
- Join
Extra operators:
- Rename
- Assignment
- Duplicate Elimination
- Aggregation
- Sorting
- Division

Each operator takes one or more relations as inputs and outputs a new relation.

| Operator | Description |
| Select | {从表中根据一些特定条件选出一个子集}(Choose a subset of the tuples from a relation that satisfies a selection predicate) |
| Projection | {从表中选出特定几个列，组成新表}(Generate a relation with tuples that contains only the specified attributes) |
| Union | {选取数个表，返回其合并后产生的新表}(Generate a relation that contains all tuples that appear in either only one or both input relations) |
| Intersection | {选取数个表，返回其取交集产生的新表}(Generate a relation that contains only the tuples that appear in both of the input relations.) |
| Difference | {对两个表，返回在第一个表中，第二个表中没有出现的元组组成的新表}(Generate a relation that contains only the tuples that appear in the first and not the second of the input relations.) |
| Product | {返回由两个表中所有元组的所有组合组成的新表}(Generate a relation that contains all possible combinations of tuples from the input relations) |
| Join | {}(Generate a relation that contains all tuples that are a combination of two tuples \(one from each input relation\) with a common value\(s\) for one or more attributes) |