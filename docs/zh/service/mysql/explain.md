---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# explain
> 一个mysql自带的sql语句性能分析工具,告诉你 MySQL 如何执行你的 SQL 语句

## 1️⃣ 基本语法
````
EXPLAIN SELECT * FROM users WHERE id = 1;
````

## 2️⃣ 输出格式
    
|  id  | select_type |  table   | partitions |   type    |  possible_keys   |      key      | key_len | ref |   rows    | filtered |  Extra   |
|:----:|:-----------:|:-------:|:----------:|:---------:|:-------:|:-------------:|:-------:|:---:|:---------:|:----:|:-------:|
| 1    |   SIMPLE    |orders_202508|            | range     |from_id,sale_status,created_at| created_at |    5    |     | 29622084  |0.08|Using index condition; Using where|

## 3️⃣ 示例
![explain](/document/explain_demo.png)

## 字段解释

### 1️⃣ select_type ：**查询类型**

| 类型 |       说明       |  
|:--:|:--------------:|
|  SIMPLE  |   简单查询（无子查询）   |
|  PRIMARY  |      主查询       |
|  SUBQUERY  |      子查询       |
|  DERIVED  |   派生表（FROM 子查询   |

### 2️⃣ partitions ：**匹配到的分区**
做了表分区才会有显示

### 3️⃣ type：**连接类型（最重要！）**

|      类型       |    性能    |                                                    说明                                                     |
|:-------------:|:--------:|:---------------------------------------------------------------------------------------------------------:|
|    system     |  ✅✅✅ 最优  |                                              该表只有一行（相当于系统表）                                               |
|     const     |  ✅✅✅极优   |                          针对主键或唯一索引的等值查询扫描, 最多只返回一行数据. const 查询速度非常快, 因为它仅仅读取一次即可                          |
|    eq_ref     |   ✅✅✅优   |                                  就是多表连接中使用primary key或者 unique key作为关联条件                                  |
|  unique_subquery  |   ✅✅✅优   |                        使用了IN查询，且子查询是主键或者唯一索引 ,例如：IN (SELECT unique_key FROM table)                        |
|      ref      |   ✅✅良好   |                                                  普通索引查询                                                   |
|  ref_or_null  |   ✅✅良好   |                            类似ref，WHERE key_column = 'value' OR key_column IS NULL                             |
|  index_merge  |   ✅可接受   |                                         使用了索引合并优化，表示一个查询里面用到了多个索引                                         |
|     range     | ⚠️中等/普通  | 范围扫描，表示检索了指定范围的行，主要用于有限制的索引扫描。比较常见的范围扫描是带有BETWEEN子句或WHERE子句里有>、>=、<、<=、IS NULL、<=>、BETWEEN、LIKE、IN()等操作符。 |
|     index     |    ❌差    |                      全索引扫描（遍历整个索引树），避免回表但数据量大时性能低 SELECT id FROM table;（假设 id 是索引列）                       |
|   fulltext    |    ❌低    |                                        使用 FULLTEXT 索引引擎完成 MATCH()…AGAINST() 查询，比全表扫描快，但由于倒排索引计算开销，通常慢于普通索引扫描                                        |
|      ALL      |  ❌❌❌最差   |                                                 全表扫描，性能最差                                                 |


### 4️⃣ possible_keys：**可能用到的索引**
显示可能使用的索引列表


### 5️⃣ key：**实际使用的索引**
可以判断出关键字段是否使用了索引？

6️⃣ key_len：**索引长度**

单位:字节


7️⃣ ref：**索引比较对象**

显示与索引比较的列或常量

8️⃣  rows：**检测行数**

* 预估值，不是实际值.估计要读取并检测的行数，越少越好
* 举个简单的例子
 
  假设你去 图书馆找书，图书馆有 10 万本书(相当于数据库的表),
  **`rows` 就像你预估需要翻多少本书才能找到目标**,值越小，说明查询越快(减少扫描量)
 
  **`filtered `就像你翻完这些书后，发现其中有多少比例是“符合条件”的书**


9️⃣ filtered：**过滤后的数据比例(单位:百分比)**

*  MySQL 估计的“扫描的行中有多少比例是符合条件的,越大越好,
* 举个简单的例子
 
  假设你去 图书馆找书，图书馆有 10 万本书(相当于数据库的表),
  **`rows` 就像你预估需要翻多少本书才能找到目标**,值越小,说明查询越快（因为检查的行数少）
 
  **`filtered `就像你翻完这些书后，发现其中有多少比例是“符合条件”的书**,值越大,说明索引越有效(减少无效数据)



🔟 Extra：**额外信息**

|    值     |       说明        |  
|:--------:|:---------------:|
|  Using index  |    覆盖索引（最优）     |
| Using where  |   使用 WHERE 过滤   |
| Using filesort |       需要文件排序（慢）       |
| Using temporary  |  使用临时表（慢）   |





