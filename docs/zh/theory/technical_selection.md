---
releaseTime: 2024/3/25
original: true
prev: false
next: false
editLink: false
comment: true

---

# 中小型it项目技术选型

最近一些年,我经常听到一些同行,张口闭口就是高并发,微服务,集群架构,什么语言垃圾,什么语言好.

一开始的时候,我还会讲道理.现在我只能说:"你说得都对";

我从个人内心来讲,我很讨厌这类人,根本不管项目是否需要这些技术,先把牛皮吹上天,显得自己很牛的样子.

99%的项目,根本用不到一些所谓的"高大上"的技术,却要硬上这些技术.我有时候我觉得他们也很可悲.

因为为了不被淘汰,去学习这些东西,去内卷,但是学了以后却又没机会使用,现在只要一有机会,就上这些技术.

他们的解释看起来也非常合理,什么方便扩容,高可用,方便后期维护吧啦吧啦一大堆.

但根本不管老板的成本,时间成本,金钱成本,维护成本,人力成本,技术欠债.

因为这都不是开发者要考虑的时间,最后一顿乱搞,开发者拿着项目练习了自己的技术,大不了项目不做,换一家公司.

但对于老板来说,却留下了烂摊子.

这些年本人在几家中小开发的公司工作过,也曾自己开工作室接外包项目.见过很多项目,一部分项目甚至活不到上线的那一天,大部分项目死于半年以内.

许多项目,在其生命周期内,也就几千用户或者几万用户甚至几十万.却要去谈架构,编程语言,并发.....岂不是可笑吗?

所以我就写下这篇文章.

`一 是让外行知道真相`

`二 是让本行业小白了解,不要听到别人提起架构就觉得高大上.`

`三 经验分享`

该技术以及工具选型,我个人认为拿他来做中小项目起步开发,完全绰绰有余.

>
> |          工具           |              用途               | 
> |:---------------------:|:-----------------------------:|
> | mysql8.4\|mariadb\|pg |             存储工具              | 
> |   redisSearch    | [全文搜索](#全文搜索),代替elasticsearch | 
> |       redisJson       |     nosql josn,代替Mongodb      | 
> |     webman queue      |   [队列](#队列),代替kafka,rabbitMQ等   | 
> |     Grafana Loki      |         日志,代替ELK或EFK等         | 

`开发web项目,应该要把上线时间,项目可扩展空间综合评估,然后把他们放在项目的第一位,而不是技术选型.`

所以上面的表格,技术工具我只选择了很少的一部分,

开发web项目,其实并不需要花里胡哨的技术,越简单越好.这样开发,维护成本都很低.在我的心目种,能用redis代替的,我都会用redis代替.

君欲善其事,必先利其器.在编程语言上,并没有限制,肯定是以最熟悉最拿手的编程语言作为开发语言.php,go,java,python都是可以的.

但是某些人,如论如何都要踩php一脚.

我分别用go和php写过项目,目前来说,写业务逻辑,java和python和php都是比较适合web项目快速开发的.go更适合爬虫,运维工具,中间件等开发.

有些人会拿性能来说事,我只能反问,你的项目真的能触及到语言的瓶颈吗?

如果只是web项目开发,仅对于我来说,我会选择php和webman框架.

webman,首先他作为web项目开发性能很好,并且非常稳定.

前任项目,项目存活时间2年,用户数40万+,从来没有因为故障而重启web服务器.

## 全文搜索
`相比elasticsearch,他更适合中小型项目,Redis官方曾公布了RediSearch与Elasticsearch的性能对比测试，自行去看吧`

::: details 点我查看
**索引能力**

对Wikipedia的560万（5.3GB）文档进行索引，RediSearch耗时221s，Elasticsearch耗时349s，RediSearch快了58%！

![LOGO](https://picx.zhimg.com/v2-64674d275c6f7c9886536fd288d8532b_r.jpg)

**查询能力**

数据建立索引后，使用32个客户端对两个单词进行检索，RediSearch的吞吐量达到12.5K ops/sec，Elasticsearch的吞吐量为3.1K ops/sec，RediSearch比Elasticsearch要快4倍。同时RediSearch的延迟为8ms，而Elasticsearch为10ms，RediSearch延迟稍微低些！

![LOGO](https://pic3.zhimg.com/v2-7518c65a6e54bde19b86e009a8f17ee2_r.jpg)


**应用场景**

`ES：`

日志分析：收集、索引、分析大量日志数据。
监控告警：实时监测系统指标，触发告警。
电子商务：商品搜索、推荐、分析销售数据。
大数据分析：大规模数据的索引、查询、聚合分析。

`RediSearch：`

实时搜索：小型到中型应用的实时全文搜索。
缓存搜索：结合Redis作为缓存层，提供快速搜索能力。
简单数据分析：对Redis中存储的数据进行轻量级统计分析。

:::
::: details 点我查看总结
**优点**
`查询速度很快,部署方便,稳定,易于维护`

**缺点**
`成本高、内存贵、持久化压力大`


**结论**

`适合中小项目.假设1kb能存储5个订单或者5条日志,那么一台16G内存的redis服务器,大约能存储 8kw 条订单,`
:::

[//]: # (--------------------------------------divider-------------------------------------)
## 队列
`webman queue 相比kafka,rabbitMQ,他更适合中小型项目`

`webman queue是框架里的一个插件,他可以直接契合项目业务代码发布,不需要像kafka,rabbitMQ单独部署(他也可以单独部署)`
::: details 点我查看测试数据
**测试**

测试机参数:
`vmware centos7 7g内存 30g机械硬盘 2处理器*2核=4核  2个消费进程`



::: code-group

```php [投递到本地队列]
# 循环10万次投递到本地队列,无网络开销
executionTime(function () use ($request){
    for ($i=0;$i<100000;$i++) {
        $queue = 'log';
        $data = ['to' => 'tom@gmail.com', 'content' => 'hello'];
        // 投递消息
        Redis::send($queue, $data);
        //Client::send($queue, $data);
    }
});

同步生产耗时： 37.892000秒   
内存使用: 196.765625 kb     
平均每秒生产`2631`次
----------------------------------------------------

异步生产耗时： 1.125000秒秒   
内存使用: 68799.460938 kb     
平均每秒生产`88888`次
----------------------------------------------------

消费耗时看 `投递到远程队列` 他们机器配置都是一样的

```

```php [投递到远程队列]
# 投递到另一台同样配置的虚拟机,请求的是内网ip,增加了远程连接开销
$redis=\support\Redis::connection('default');
        list($usec, $sec) = explode(' ', microtime());
        $millisecond = (int) (($sec * 1000) + ($usec * 1000));
        var_dump("当前毫秒时间戳：$millisecond");
        executionTime(function () use ($request,$redis){
            for ($i=0;$i<100000;$i++) {
                $queue = 'log';
                $data = ['to' => 'tom@gmail.com', 'content' => 'hello','i'=>$i];
                $queue_waiting = '{redis-queue}-waiting';
                $now = time();
                $package_str = json_encode([
                    'id'       => rand(),
                    'time'     => $now,
                    'delay'    => 0,
                    'attempts' => 0,
                    'queue'    => $queue,
                    'data'     => $data
                ]);
                $redis->lPush($queue_waiting.$queue, $package_str);
            }
        });

生产耗时： 41.387000秒   
内存使用:   3.007812 kb     
平均每秒生产`2416`次
----------------------------------------------------
消费耗时：  100.72秒   
内存占用峰值增加: 7.72MB
平均每秒消费 `992` 次
```

```php [投递到远程多个队列]
# 一个order队列,一个log队列,均在队列系统服务器中,每个队列都有两个消费进程等候
$redis=\support\Redis::connection('default');
        list($usec, $sec) = explode(' ', microtime());
        $millisecond = (int) (($sec * 1000) + ($usec * 1000));
        var_dump("当前毫秒时间戳：$millisecond");
        executionTime(function () use ($request,$redis){
            for ($i=0;$i<100000;$i++) {
                $queueOrder = 'order';
                $queueLog = 'log';
                $data = ['to' => 'tom@gmail.com', 'content' => 'hello','i'=>$i];
                $queue_waiting = '{redis-queue}-waiting';
                $now = time();
                $package_str = json_encode([
                    'id'       => rand(),
                    'time'     => $now,
                    'delay'    => 0,
                    'attempts' => 0,
                    //'queue'    => $queue,
                    'data'     => $data
                ]);
                $redis->lPush($queue_waiting.$queueLog, $package_str);
                $redis->lPush($queue_waiting.$queueOrder, $package_str);
            }
        });

生产耗时：  90.21秒   
内存使用:   3.007812 kb     
平均每秒生产`1108`次 
----------------------------------------------------
`log`   队列消费耗时：  100.954秒   平均每秒消费 `990` 次
`order` 队列消费耗时：  101.082秒   平均每秒消费 `989` 次
内存占用峰值增加: 17.38MB

```




:::


::: details 点我查看总结
**优点**

`生产速度还行,没有额外的部署,维护,学习成本. 上手快,开发快,稳定,易修改,上线快`

**缺点**

`受机器配置限制,消费速度效果表现很普通,
而且使用异步队列需要非常慎重,消息会写入内存执行,他不像kafka,RabbitMQ那样有持久化机制.重启会丢失消息.同步则不会`


**结论**

`适合中小项目,非高频交易项目,可以通过2台分布式队列服务器,和提升配置,把同步队列入队速度干到每秒2000+.当然,具体耗时得取决你的业务逻辑.
以前在某论坛,听到某盘项目,800万用户+,巅峰时期订单也就每秒500+
`
:::

[//]: # (--------------------------------------divider-------------------------------------)























