---
releaseTime: 2025/8/4
original: true
prev: false
next: false
editLink: false
comment: true

---

max_user_connections = 0
table_open_cache = 2000
thread_cache_size = 100
max_connections = 1200
max_prepared_stmt_count = 50000
innodb_buffer_pool_size=5G

# 如何在团队中使用git?

> 和其他新成员配合共事时,发现当团队配合开发的时候,就不会使用git了,分支滥用,乱用
>
> 特征都是phper,或是曾经是phper,但是php不背这锅.
>
> 没办法,只能自己琢磨了

按照传统的分页查询办法,肯定不行.鬼知道客户在以前的某个月是否有下订单.也不可能每张月份表依次去查询.
经过调研`微信支付,淘宝,支付宝,拼多多`这4款大产品,以及网上一些相关资料,结合个人的分析,判定`不按照月份实现上拉刷新`这个功能挺麻烦的.

## 调研4大产品实现的订单记录下拉分页的表现效果
::: code-group
````[淘宝]
不按月份下拉翻页,每页10条记录,速度极快,即便翻页到10年前,响应速度非常快,

个人分析:
不清楚如何实现,
个人认为并非内存提前加载了所有的记录,有可能提前加载了下一页的数据.
个人猜测并非是分表中间件的功劳,因为这么搞,要吃的内存太多太多了.
有可能是仓(elasticSearch,Clickhouse等)的功劳+提前加载下一页,
也有可能做的是按user_id分库分表,百库百表等+魔改后的mysql.
````
````[pdd]
和淘宝一样
````
````[微信支付]
每页20条记录,按月分表,仅展示最近12个月的交易数据,
超过12个月后的数据,必须选择年月来查询

个人分析:
可能使用数仓工具,增加记录到mysql的月份表同时也增加到数仓里,
数仓(elasticSearch,Clickhouse等)保存最近一年的数据作为分析和查询,
历史数据则作为冷数据,必须按年月查询
````


````[支付包支付记录]
第一页展示了38条记录,第二页展示了20条记录,第三页展示了36条记录,第4页展示了20条记录,
按月分表

个人分析:
这里的38并非是一个固定的数字,是因为8月份刚好只有18条记录,
于是它从7月份取了20条记录补上,所以第一页有了38条数据.
但7月份超过40条记录,即便借给8月份20条,剩下的页足够分页,所以它第二页展示了20条记录
````
:::

## 调研结论
淘宝和拼多多那样的效果固然很好,但是开发,维护成本太高了,不适用中小微企业,也不符合 [RubyBook的宗旨](/theory/whatsRubyBook),

即便中型企业要强上这样的效果,那么也会严重影响工期质量.小微企业就不用说了,就掏不出这样的成本.

所以,接下来我会讲诉如何实现 `微信支付,支付宝支付`的客户端app上拉分页效果



## 遗憾
写到这里的时候我决定放弃编写了,直接union all就完事了.

一开始我曾想过,union all多表联查性能会不好,于是我想过其他比较麻烦的方案来实现,所有就有了这篇文章

但是万万没想到,union all结果超出我的想象, [union all性能测试](/service/mysql#union-all)

直接union all联查6表(半年数据),记得一定要走索引.超过半年的数据,让用户手动选择时间就完事了.

从 union all结果集中做如下操作

1.缓存第一页2秒,避免客户端反复刷新
2.缓存下一页5秒,给用户更好的体验

## 追加
又过了两天,我思来想去,还是补上这一部分内容.

如果有哪个天杀的甲方,非要你像淘宝,pdd一样,那我就只有祭出这个方案了.

准备一个用户订单记录表,大概格式如下,每当订单完结后,在对应的月份增加值


| id | user_id | ext                                                           |
 |:--:|:-------:|---------------------------------------------------------------|
| 1  |  1001   | `{"202508":5,"202507":24,"202503":39,"202502":1,"202408":11}` |
| 2  |  1002   | ...                                                           |
| 3  |  1003   | ...                                                           |
| 4  |  1004   | ...                                                           |


id=1,代表202508的时候,用户产生了5笔完结的订单.

每页20条数据,我们可以计算出8月份+7月份有29条数,于是我们就有如下sql:

````
# 第一页,8月份全部取,7月份取15条
SELECT order_no, user_id FROM order_202508 WHERE user_id = 1001
UNION ALL
(
    SELECT order_no, user_id 
    FROM order_202507 
    WHERE user_id = 1001 
    ORDER BY id DESC  
    LIMIT 15
);

# 第2页,7月份已经被取了15条,所以取剩下的9条,然后再取3月份的11条
(
    SELECT order_no, user_id FROM order_202508 
    WHERE user_id = 1001 
    ORDER BY id DESC  LIMIT 15,9
)
UNION ALL
(
    SELECT order_no, user_id FROM order_202507 
    WHERE user_id = 1001 
    ORDER BY id DESC  
    LIMIT 0,11
);
# 第3页,以此类推
````

### 疑问1
8月份如果有x条未完结的订单,此时limit 0,15将不再准确,该如何查询

通过分析淘宝交易未结束的订单,最迟15天会自动交易关闭.所以先计算出交易未结束的订单
```
const dateD=8; //今天8号

const day=0; //交易未结束的订单的数量

if(dateD>15){
    day=SELECT count(id) from order_202508 WHERE user_id = 1001 where status='交易未结束';
}else{
    day=SELECT SUM(cnt) AS total_unfinished_orders
FROM (
    SELECT COUNT(id) AS cnt FROM order_202508 WHERE user_id = 1001 AND status = '交易未结束'
    UNION ALL
    SELECT COUNT(id) AS cnt FROM order_202507 WHERE user_id = 1001 AND status = '交易未结束'
) t;    

假设 day=6;  // 有6条订单未完结.不可能会超过10条.

order_202508,order_202507 那么共有24+5+6=35条数据

// 最终查表sql 第一页
(
    SELECT order_no, user_id FROM order_202508 WHERE user_id = 1001
    UNION ALL
    SELECT order_no, user_id FROM order_202507 WHERE user_id = 1001
)
order by id desc LIMIT 0, 20;

// 最终查表sql 第2页
(SELECT order_no, user_id FROM order_202507 WHERE user_id = 1001 ORDER BY id DESC  LIMIT 21,15)
union all 
(SELECT order_no, user_id FROM order_202503 WHERE user_id = 1001 ORDER BY id DESC  LIMIT 0,5)
} order by id desc;

// 最终查表sql 第3页
SELECT order_no, user_id FROM order_202503 WHERE user_id = 1001 ORDER BY id DESC  LIMIT 6,20
order by id desc;

...以此类推,自行用算法实现


```

**此办法会多查询两条sql,但是效率并不差.**



















