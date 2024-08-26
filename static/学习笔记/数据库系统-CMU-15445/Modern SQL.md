# Modern SQL
 
SQL is based on ##bags##(duplicates & defined order) not ##sets##(no duplicates & no order)

## Aggregates

- ##AVG(col)## Return average col value
- ##MIN(col)## Return minimum col value
- ##MAX(col)## Return maximum col value
- ##SUM(col)## Return sum of values in col
- ##COUNT(col)## Return count of values for col

使用 ``GROUP BY`` 分组数据
使用 ``HAVING`` 筛选 ``GROUP BY`` 分组后的数据

## String Operations

不同的数据库对字符串有不同的处理方式，你可能无法直接在一个数据库中使用在另一个数据库中能够正常工作的 SQL。

| | String Case | String Quotes |
| SQL-92   | Sensitive   | Single Only |
| Postgres | Sensitive   | Single Only |
| MySQL    | Insensitive | Single/Double |
| SQLite   | Sensitive   | Single/Double |
| MSSQL    | Sensitive   | Single Only |
| Oracle   | Sensitive   | Single Only |

### 用 LIKE 来进行字符串匹配

- 用 ``'%'`` 匹配任意子字符串
- 用 ``'_'`` 匹配任意单个字符

## Date / Time Operations

当前时间
日期差值计算

## Output Redirection

将通过一些操作产生的表插入到一个已存在的表或新表中。

```sql
CREATE TABLE CourseIds (
  SELECT DISTINCT cid FROM enrolled);
```

## Output Control

- ``ORDER BY`` 将输出的表按照其中某一列以升序或降序排序
- ``LIMIT`` 限制输出的表的元组数量，也可以设置偏移量

## Nested Queries

SQL 不止可以从现有的表中进行操作，产生新表，也可以对其它操作产生的表进一步操作，产生新表。

```sql
SELECT name FROM student
  WHERE sid IN (SELECT sid FROM enrolled)
```

针对子查询的操作符：
- ``ALL`` {将主查询中的元组与子查询中的所有元组进行比较，当所有比较通过时条件成立}(Must satisfy expression for all rows in the sub-query)
- ``ANY`` {与 ALL 相似，但只要与子查询中任一元组满足条件即可}(Must satisfy expression for at least one row in the sub-query).
- ``IN`` Equivalent to '=ANY()' .
- ``EXISTS`` {检查子查询，当子查询返回至少一个元组时条件成立}(At least one row is returned without comparing it to an attribute in outer query)

## Window Functions

- Aggregation functions: 即上文提及的 Aggregates
- Special window functions:
    - ``ROW_NUMBER()`` count of the current row
    - ``RANK()`` Order position of the current row

选取 ``enrolled`` 表中所有的元组并附加行号
```sql
SELECT *, ROW_NUMBER() OVER () AS row_num
  FROM enrolled
```

选取每门课成绩第二高的学生
```sql
SELECT * FROM (
  SELECT *, RANK() OVER (PARTITION BY cid
    ORDER BY grade ASC) AS rank
  FROM enrolled) AS ranking
WHERE ranking.rank = 2
```

## Common Table Expressions

将查询结果存到临时的表中

示例：
```sql
WITH cteName AS (
  SELECT 1
)
SELECT * FROM cteName
```

在 CTE 中绑定新的列名：
```sql
WITH cteName (col1, col2) AS (
  SELECT 1, 2
)
SELECT col1 + col2 FROM cteName
```

使用 ``RECURSIVE`` 以在 CTE 中使用自身：
```sql
WITH RECURSIVE cteSource (counter) AS (
  (SELECT 1)
  UNION ALL
  (SELECT counter + 1 FROM cteSource
    WHERE counter < 10)
)
SELECT * FROM cteSource
```
