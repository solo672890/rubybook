---
releaseTime: 2024/9/10
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# C2C交易订单表按月分表后如何查询
> 分表后查询和平常的单表区别还是很大的
> 
> 分表设计是按照 `上亿级别的项目思路去设计`,如果是千百万级别的订单则无需分表,分区就行
> 
> 或许会有疑问? 为什么不适用mycat这类工具
> 
>  请不要忘了 Rubybook的宗旨

## 分析
项目是一个C2C在线交易平台,分表后对技术思路最大的挑战来自于,如何高性能查询表.如何快速找到相关的表中的数据,所以,索引是重点.

略微也要改变一些以前传统单表的查询方法.

::: details 订单表结构
```` bash
orders_202505
orders_202506,
orders_202507.....
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
  KEY `idx_sale_status` (`sale_status`) USING BTREE,
  KEY `idx_created_at` (`created_at` DESC) USING BTREE,
  KEY `idx_from_status_created` (`from_id`,`sale_status`,`created_at` DESC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=25192398 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='订单表';
````
:::

::: tip 注意
`KEY 'idx_from_id' ('from_id','sale_status','created_at' DESC) USING BTREE`

这个索引一定要这么建立.如果满足 `from_id=xxx and sale_status='start'` 这种条件的数据很多的情况下(2000+),那么这个sql不论怎么查都非常慢.即便已经挂上了`idx_from_status_created`索引

`KEY 'idx_from_status' ('from_id','sale_status') USING BTREE` 这是之前的做法.

`(select id,from_id,sale_status,created_at from orders_202508 where  from_id=7 and sale_status='start' and created_at>'2025-09-04 22:43:16'  ORDER BY created_at desc limit 0,50 ) limit 0,50;`

当单表达到1000万+时候,SSD查询,这个查询耗时3s+,

当单表达到6000万+数据的时候,SSD查询,这个查询耗时8s+,

添加`created_at BTREE`后,4表union all共计1亿3千万+数据,SSD查询降低到0.15s.

原因是,虽然rows行数并不多,`order by created_at desc `使用不上索引,大量随机 I/O + 未能倒序早停 导致耗时
:::

::: danger 添加一项配置
[mysqld]
optimizer_switch=batched_key_access=on,mrr=on
:::

## 查询场景 

::: details  **附带一个大表优化后的sql union all children select**
````php
SET profiling = 1;
(SELECT a.id,a.from_id,a.sale_status,a.created_at,a.order_no,b.*
FROM orders_202506 a
LEFT JOIN orders_detail_202506 b ON a.order_no = b.order_no
WHERE a.from_id = 7 AND a.sale_status = 'start' AND a.created_at > '2025-09-04 22:43:16' AND a.id > 1000
ORDER BY a.created_at DESC LIMIT 0,50
) UNION ALL
(SELECT a.id,a.from_id,a.sale_status,a.created_at,a.order_no,b.*
FROM orders_202507 a
LEFT JOIN orders_detail_202507 b ON a.order_no = b.order_no
WHERE a.from_id = 7 AND a.sale_status = 'start' AND a.created_at > '2025-09-04 22:43:16' AND a.id > 1000
ORDER BY a.created_at DESC LIMIT 0,50
) UNION ALL
(SELECT a.id,a.from_id,a.sale_status,a.created_at,a.order_no,b.*
FROM orders_202508 a
LEFT JOIN orders_detail_202508 b ON a.order_no = b.order_no
WHERE a.from_id = 7 AND a.sale_status = 'start' AND a.created_at > '2025-09-04 22:43:16' AND a.id > 1000
ORDER BY a.created_at DESC LIMIT 0,50
)
LIMIT 0,50;
SHOW PROFILES;

3表共计数据1亿2千万数据,SSD查询耗时 0.14s // [!code warning:3]
ORDER BY a.created_at DESC 千万不能改成 ORDER BY a.id DESC
order_no 索引是关键

````
:::

* **后台管理端  --------------------------**

::: warning info
这些场景都使用游标查询法,思路都完全一样,只不过查询条件有所不同.

为什么要限制查询时间? 超过的时间要手动选择时间查询?
* 查询6个月以前的订单,这类场景需求非常少,所以要管理员手动选择时间范围查询
* 也可以通过报表统计功能,查看以前订单的大概
* 交易状态中的订单很难拖到3个月却还未处理结束,属于极端情况了
:::

::: details  **场景1️⃣** 订单面板首页,默认查询 [`无限制查`]
这类查询条件非常宽松,所以只需要按照游标查询法,挨个表查询即可
:::

::: details  **场景2️⃣** 查询进行中的订单  [`查6个月`]
先`照游标查询法`联查3个月,3个月都没数据,说明是冷门用户,再联查一次3个月的订单,最多查询两次.
:::

::: details  **场景3️⃣** 查询指定订单状态  [`查6个月`]
:::

::: details **场景4️⃣** 查询指定用户+所有状态  [`查6个月`]
先`照游标查询法`联查3个月,3个月都没数据,说明是冷门用户,再联查一次3个月的订单,最多查询两次.
:::

::: details   **场景5️⃣** 查询指定用户+指定状态 [`查6个月`]
先`照游标查询法`联查3个月,3个月都没数据,说明是冷门用户,再联查一次3个月的订单,最多查询两次.
:::
::: details  **场景6️⃣** 查询指定用户+指定状态+指定时间 [`查6个月`]
先`照游标查询法`联查3个月,3个月都没数据,说明是冷门用户,再联查一次3个月的订单,最多查询两次.
:::

::: details  **场景7️⃣** 查询指定状态+指定时间 [`查6个月`]
先`照游标查询法`联查3个月,3个月都没数据,说明是冷门用户,再联查一次3个月的订单,最多查询两次.
:::
::: details 游标查询法demo
 单表2500万+ `SSD:0.11s`    `buffer pool:0.077s`  `use index:created_at`

```` ts 
$cursor_at =request('cursor_at',null);
$cursor_id =request('cursor_id',null);
$pageSize =request('pageSize',50);
$initTable="202508";//初始表
if($cursor_at==null) { //游标为空,说明是第一页
    $currentTableName=date('Ym');
    $result=DB::table($currentTableName)->query('select * from '.$currentTableName .' order by id desc limit 0,50');

    if(empty($result)) { // 如果为空,说明当月可能还没产生新的订单,则去查上月
        $lastTableName=date('Ym',"-1 month");
        $result=DB::table($currentTableName)->query('select * from '.$lastTableName .' order by id desc limit 0,50');
        if(empty($result)) {
            return [];
        }
    }
    //本月不足够分页,则把数据塞进下一月里
    if(count($result) < $pageSize) {
        $lastTableName=date('Ym',"-1 month");
        $lastResult=DB::table($currentTableName)->query('select * from '.$lastTableName .' order by id desc limit 0,50');
        if(!empty($lastResult)) {  //如果上一月有数据,
            array_unshift($result,$lastResult);
        }
        $cursor=$result[array_key_last($result)];
        $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
        $cursor_id=$cursor['id'];
        return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
    }
    $cursor=$result[array_key_last($result)];
    $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
    $cursor_id=$cursor['id'];

    return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
}
// 走到这里,说明有游标
$currentTableName= date('Ym', $cursor_at); //获取游标所在的月份
$cursor_at=date('Y-m-d H:i:s',strtotime($cursor_at)-1);
$result=DB::table($currentTableName)->query("select * from $currentTableName where created_at > $cursor_at and id > $cursor_id order by id desc limit 0,50");

$currentPageNum=count($result);

if($currentPageNum > $pageSize) {
    //TODO 游标所在的月份可能不足以分页,依然要和上个月的数据进行合并
    $lastYm=date('Ym',strtotime($cursor_at,"-1 month"));  //获取上一月份的table
    
    if($lastYm > $initTable){ //如果小于初始页,说明就没有数据了.那么只能返回最后一次游标的数据了
        $cursor=$result[array_key_last($result)];
        $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
        $cursor_id=$cursor['id'];

        return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
    }else{
        $lastYmResult=DB::table($lastYm)->query("select * from $currentTableName where created_at > $cursor_at and id > $cursor_id order by id desc limit 0,50");
        array_unshift($result,$lastYmResult); //合并数据
    }
}

$cursor=$result[array_key_last($result)];
$cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
$cursor_id=$cursor['id'];

return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
````
:::

* **客户端查询  --------------------------**

::: warning info
客户端虽然页也使用游标查询法,但代码思路有不同
* 一. 无状态查询时,限定查询历史记录时间:`6个月`,超过时间,则自行手动选择时间查询.
* 二. 先联查2个月数据,如果两个月数据都不够够分页,说明是非热门用户,再给他联查4个月.也就是查两次.
:::



::: details **场景1️⃣** 默认查询,查询全部状态
单表2500万+ `SSD:0.11s`    `buffer pool:0.077s`  `use index:created_at`

`代码仅代表思路`
```` ts 
public function test1(Request $request) {
    $cursor_at =request('cursor_at',null);
    $cursor_id =request('cursor_id',null);
    $pageSize =request('pageSize',30);
    $userId=7;
    $initTable="202508";//初始表
    if($cursor_at==null) { //游标为空,说明是第一页
        $currentTableName=date('Ym');
        $lastTableName=date('Ym',strtotime("-1 month"));
        $lastLastTableName=date('Ym',strtotime("-2 month"));
        //没有上上月的月份表
        if($lastLastTableName<$initTable) {
            //没有上一月的月份表,说明是新项目,那就直接返回结果把
            if($lastTableName<$initTable) {
                $result=DB::table($currentTableName)->query("select * from $currentTableName where from_id=$userId order by id desc limit 0,50");
                $cursor=$result[array_key_last($result)];
                $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
                $cursor_id=$cursor['id'];
                return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
            }
            //否则联查2表即可
            return $this->unionAllSplice("2表联查");
        }
        //根据游标联查 3个月
        return $this->unionAllSpliceForCursor($cursor_at,$cursor_id,$pageSize);
    }
}
//组装一次三表 union all,返回游标时间 + 游标id +数据
private function unionAllSplice($num="3张表联查") {
    $currentTableName="当前表";
    $lastTableName="上月表";
    $lastLastTableName="上上月表";
    $result=DB::table($currentTableName)->query("
(select id,from_id,sale_status,created_at from $currentTableName 
where  from_id=7  
ORDER BY created_at desc limit 0,50  ) 
union all
(select id,from_id,sale_status,created_at from $lastTableName 
where  from_id=7  
ORDER BY created_at desc 
limit 0,50 )
union all 
limit 0,50               
");
    //如果三表都没数据,那么就再查一次3表联查
    if(empty($result) && $num='3张表联查') {
        $result=DB::table($currentTableName)->query("
(select id,from_id,sale_status,created_at from $currentTableName 
where  from_id=7  
ORDER BY created_at desc limit 0,50  ) 
union all
(select id,from_id,sale_status,created_at from $lastTableName 
where  from_id=7  
ORDER BY created_at desc 
limit 0,50 )
union all 
limit 0,50               
");
    }
    $cursor=$result[array_key_last($result)];
    $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
    $cursor_id=$cursor['id'];
    return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
}

//根据游标联查 3个月
private function unionAllSpliceForCursor($cursor_at,$cursor_id,$pageSize) {
    $currentTableName="当前表";
    $lastTableName="上月表";
    $lastLastTableName="上上月表";
    $cursor_at=$cursor_at-1;
    $result=DB::table($currentTableName)->query("
(select id,from_id,sale_status,created_at from $currentTableName 
where  from_id=7 created_at > $cursor_at and id >  $cursor_id
ORDER BY created_at desc limit 0,50  ) 
union all
(select id,from_id,sale_status,created_at from $lastTableName 
where  from_id=7 created_at > $cursor_at and id >  $cursor_id
ORDER BY created_at desc 
limit 0,50 )
union all ..... $lastLastTableName
limit 0,50               
");
    //如果三表都没数据,那么就再查一次3表联查
    if(empty($result) ) {
        //todo 再检查前三张表是否存在
        $result=DB::table($currentTableName)->query("
(select id,from_id,sale_status,created_at from $currentTableName 
where  from_id=7 created_at > $cursor_at and id >  $cursor_id
ORDER BY created_at desc limit 0,50  ) 
union all
(select id,from_id,sale_status,created_at from $lastTableName 
where  from_id=7 created_at > $cursor_at and id >  $cursor_id
ORDER BY created_at desc 
limit 0,50 )
union all ..... $lastLastTableName
limit 0,50               
");
    }

    $cursor=$result[array_key_last($result)];
    $cursor_at=$cursor['created_at']; //把数组中最后一个元素的 时间作为游标
    $cursor_id=$cursor['id'];
    return ['result'=>$result,'cursor_at'=>$cursor_at,'cursor_id'=>$cursor_id];
}
````
:::

::: details **场景2️⃣** 带状态查询,同上.




















