---
releaseTime: 2024/5/5
original: true
prev: false
next: false
editLink: false
comment: true

---

# 如何设计每天一亿订单的项目架构?

>**最近刷到这样一个有意思的话题,虽然我没有做过这样的项目,但作为一个多年行业从业者,遇到从来没有遇到过的问题,是要临危不乱,更要有自己的解决方案**


 |             目标              |                   实现方式                   | 
 |:---------------------------:|:--------------------------------------:|
 |    高性能    |             RedisSearch + Elasticsearch + 分布式缓存              | 
 | 低成本 | 冷热数据分离 + 高效存储（如 HBase/MySQL） | 
 |          低成本          |       微服务架构 + 水平扩展（Kafka/Redis Cluster/ES Cluster）       | 
 |        高可用         |    多副本 + 容灾机制 + 自动恢复     | 

![架构图](/document/1m_selection.png)



<a href="/public/file/如何设计每天一亿订单的订单系统.xmind" download="我的思维导图.xmind">
  💾 点击下载 XMind 文件
</a>

虽然是一亿订单项目架构,但实际上,可能会产生20亿次请求,里面有一些部分,比如安全,要防范ddos,cc,爬虫.要单独开篇讲解.































