---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# 记一次 order by 优化
> order by是一个使用频率非常高的sql用法,在一次测试中，发现耗时异常，记录该问题的解决方案



::: details 表结构
```` bash
CREATE TABLE `orders_202508` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_id` int NOT NULL DEFAULT '0' COMMENT '卖家id',
  `amount` float(11,2) NOT NULL,
  `sale_status` enum('start','trade_ing','trade_cancel','trade_stop','trade_finish') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'start',
  `delete_at` datetime DEFAULT NULL COMMENT '创建时间',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `notify_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plat_form_order` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `notice_finish` int DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_no` (`order_no`),
  KEY `from_id` (`from_id`) USING BTREE,
  KEY `sale_status` (`sale_status`) USING BTREE,
  KEY `created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci  ;
````

awk '{
# 1. 提取 rt 数值
split($(NF-1), rt_arr, "=");
rt_val = rt_arr[2] + 0;

    # 2. 过滤：仅保留 rt > 0.07（70ms）
    if (rt_val > 0.07) {
        # 3. 输出核心字段（| 分隔），完全跳过 UA
        printf "[%s] %s | %s %s | %s | %s | %s | %s | %s | %s\n", \
            FILENAME, $1, $3, $4, $8, $9, $10, $(NF-2), $(NF-1), $NF;
    }
}' /www/wwwlogs/{920l.com,91ysys.com,3iuu.cn}.log | tail -50

:::

## 1️⃣耗时语句
```` ts 
SELECT from_id, sale_status, created_at 
FROM orders_202508 WHERE from_id = 7 
  
UNION ALL
SELECT from_id, sale_status, created_at 
FROM orders_202507 WHERE from_id = 7 
  
UNION ALL
SELECT from_id, sale_status, created_at 
FROM orders_202506 WHERE from_id = 7 

UNION ALL
SELECT from_id, sale_status, created_at 
FROM orders_202505 WHERE from_id = 7 

UNION ALL
SELECT from_id, sale_status, created_at 
FROM orders_202504 WHERE from_id = 7 

ORDER BY created_at desc
LIMIT 0, 20;

5表共计1亿5千万数据                                 // [!code warning:3]
buffer pool查询耗时   0.5s              
SSD 磁盘 查询耗时        85.925s                       
````


## 2️⃣ 问题
* 即便全部加上索引，耗时为什么这么久？

* 数据量太大？


## 3️⃣ 分析
* 先排除union all的问题，5表union all确实会损失一些性能，但在能接受的范围内。[union all测试](/service/mysql/unionAll)
* 单表1千万的表中测试，`SSD 磁盘 查询耗时:5.7s`,`buffer pool查询耗时: 0.11s` 排除数据量太大导致的问题
* explain 分析索引

![explain](/document/explain_demo1.png)

`从result id=6 中的 <union1,2,3,4,5> Using filesort 发现  即便created_at 添加了索引，但是在order by 下，却还是全表扫描。这是导致性能差的原因`

临时表没有 `created_at` 索引 ,`UNION RESULT`阶段需要对临时表全扫描排序


### 4️⃣ 进一步分析

这一亿4千万数据中，符合 `from_id=7`的数据有 `143727`条，如此多的数据，又无法在临时表中对他们索引，`order by`排序`created_at`的时候把大部分时间耗费这这个阶段了。

**疑问🤔？** 从表结构中，`created_at` 明明已经添加了索引？`order by`为什么无法利用呢？

### 5️⃣ 思考
`order by` 在 `union all`是这样的表现，在其他查询中表现如何呢？

::: details 测试
准备了一张 2500万数据左右的表，符合`from_id`的数据是`25034条`
![explain](/document/explain_demo2.png)

结果令人惊讶，SSD查询居然耗时 23.88s，`buffer pool`查询耗时0.2s。

赶紧用explain分析
![explain](/document/explain_demo3.png)

发现索引利用低下，`form_id`完全没有用上，反而用上了`created_at`。原因是 索引优化器认为 用 `created_at` 索引成本更低。

但真就如此吗🤔？

于是赶紧添加了强制索引，看看 `form_id` 还是 `created_at` 用谁的效率更高.

`FORCE INDEX (from_id)`

**输出**

| select_type |  table   |    type    |  possible_keys   |      key      |       rows     | filtered |  Extra   |
|:-----------:|:-------:|:---------:|:-------:|:-------------:|:---:|:----:|:-------:|
|   SIMPLE    |orders_202508|     ref     |from_id| from_id |       29622084 |100.00|Using filesort|

`result :` SSD 查询 11.7s, `buffer pool`查询耗时 0.146s

使用强制索引后，发现性能提升了非常多，索引级别也从 index 变成了 ref.但非常遗憾的是，这样的结果依然无法令人接受。





:::


### 6️⃣ 结论
通过分析和思考，我们可以得出如下结论

* `MySQL的索引优化器不能完全相信它`你认为添加了索引，有可能实际上并未使用上
* `即便利用了索引，也不代表效率高` 
* `union all 会生成临时表，临时表中无法使用索引` 


### 7️⃣ 处理

* 优化sql语句，把` ORDER BY created_at`放入子查询，让`created_at` 被利用上

```` js
( SELECT from_id, sale_status, created_at FROM orders_202508 WHERE from_id = 7 ORDER BY created_at desc)  UNION ALL
( SELECT from_id, sale_status, created_at FROM orders_202507 WHERE from_id = 7 ORDER BY created_at desc) UNION ALL
( SELECT from_id, sale_status, created_at FROM orders_202506 WHERE from_id = 7 ORDER BY created_at desc) UNION ALL
( SELECT from_id, sale_status, created_at FROM orders_202505 WHERE from_id = 7 ORDER BY created_at desc) UNION ALL
( SELECT from_id, sale_status, created_at FROM orders_202504 WHERE from_id = 7 ORDER BY created_at desc) 
LIMIT 0,50;

优化后： // [!code warning:3]
SSD查询：0.21s     // [!code warning:3]
buffer pool查询：0.08s // [!code warning:3]

````
0.21s，并没达到我的预期

* 优化DDL语句，更改索引

* 添加limit,尽早截停

* my.cnf 新增配置 `optimizer_switch=batched_key_access=on,mrr=on`

order by `column` ,column和其他单列索引一起使用，通过分析，发现很难被利用上，所以我们需要聚簇索引

改造后的DDL表结构

````
CREATE TABLE `orders_202508` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_id` int NOT NULL DEFAULT '0' COMMENT '卖家id',
  `amount` float(11,2) NOT NULL,
  `sale_status` enum('start','trade_ing','trade_cancel','trade_stop','trade_finish') CHARACTER SET utf8mb4  DEFAULT 'start',
  `delete_at` datetime DEFAULT NULL COMMENT '创建时间',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `notify_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plat_form_order` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `notice_finish` int DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_no` (`order_no`) USING BTREE,
  KEY `from_id` (`from_id`,`sale_status`,`created_at` DESC) USING BTREE,
  KEY `sale_status` (`sale_status`) USING BTREE,
  KEY `created_at` (`created_at` DESC) USING BTREE
) ENGINE=InnoDB  ROW_FORMAT=DYNAMIC COMMENT='订单表';
````

## 8️⃣ 效果 
::: tip 效果
5表联查,共计数据1亿4千5百万数据,SSD查询 0.167s
:::
![explain](/document/explain_demo4.png)