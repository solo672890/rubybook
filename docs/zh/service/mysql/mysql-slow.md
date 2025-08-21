---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# MySQL慢日志
开启前需要在命令行中检查一下: `show variables like 'profiling';`

一般都是默认关闭,如果开启了,需要执行 `SET GLOBAL profiling = OFF;`

避免慢日志文件里写入太多不需要的分析信息

该命令不要用navicat这样的工具执行,要在命令行里执行



## 慢日志开启
````
# =========================
# /etc/my.cnf
# =========================
log_output=FILE
slow_query_log = ON                           # 慢查询日志
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 0.5                         # 超过0.5秒记录慢查询
log_queries_not_using_indexes = ON            # 记录未使用索引的查询
general_log = 0                               # 关闭通用日志（性能开销大）
# 每分钟最多记录10条未使用索引的查询,防止日志爆炸
log_throttle_queries_not_using_indexes = 10 
log_slow_slave_statements = ON                # 记录锁等待时间超过阈值的查询
````

`生产环境必须开启慢查询日志`（slow query log），这是数据库运维的"生命线"之一。 它是发现性能问题、优化 SQL、预防系统崩溃的关键工具.
1. 99% 的性能问题 最初都表现为慢查询,慢查询日志是最早发现问题的途径,`等到系统卡死、CPU 100%
   时，已经太晚了`
2. 没有慢查询日志，优化就是"盲人摸象",你不知道哪些 SQL 需要优化,优化后也无法验证效果

**不开慢查询日志的风险**

|      风险      |              说明              | 
 |:------------:|:----------------------------:|
|    发现问题延迟    |       从"用户投诉"才意识到性能问题        | 
|    优化无从下手    |         不知道该优化哪个 SQL         | 
|     重复踩坑     |          同样的慢查询反复出现          | 

**开启慢查询日志会影响性能?**

现代服务器（尤其是 SSD）上，`写入慢查询日志的开销可以忽略不计`

测试数据：在 4核8GB + SSD 环境下：`每秒 100 条慢查询 → 日志写入开销 < 1% CPU`

**监控**

```
# (每)10分钟内出现 > 5 条慢查询，立即告警
# crontab -e
*/10 * * * * count=$(grep -c "$(date -d '5 minutes ago' '+%y%m%d %H:%M')" /var/log/mysql/mysql-slow.log); [ $count -gt 5 ] && echo "告警：$count 条慢查询" | mail admin@yourcompany.com
```

````
# 实时监控慢查询
tail -f /var/log/mysql/mysql-slow.log

# 查看最慢的 10 条查询
mysqldumpslow -s at -t 10 /var/log/mysql/mysql-slow.log
````

## 慢日志分割-logrotate
**效果:** 每天分割一次,超过10M则立即分割

✅ 步骤 1：创建并授权慢日志归档目录

```
sudo mkdir -p /var/log/mysql/slow_log_archive && sudo chown mysql:mysql /var/log/mysql/slow_log_archive && sudo chmod 750 /var/log/mysql/slow_log_archive
```

✅ 步骤 2：创建并授权慢日志记录文件
````shell
sudo mkdir -p /var/log/mysql && sudo touch /var/log/mysql/mysql-slow.log && sudo chown -R mysql:mysql /var/log/mysql && chmod 640 /var/log/mysql/mysql-slow.log
 
````

✅ 步骤 3：修改配置文件

`vim /etc/logrotate.d/mysql-slow`
````
/var/log/mysql/mysql-slow.log {
    size 20M
    missingok
    compress
    rotate 15
    notifempty
    create 640 mysql mysql
    dateext                   
    dateformat -%Y%m%d_%H%M        
    sharedscripts
    postrotate
        # 通知 MySQL 重新打开慢日志文件
        mysqladmin -uroot -ptest351c042ae7_A flush-logs 2>/dev/null
    endscript
}

````

✅ 步骤 4：测试
````bash
#手动强制执行一次 -f
sudo logrotate -f /etc/logrotate.d/mysql-slow
# 非强制,线上用
sudo logrotate  /etc/logrotate.d/mysql-slow
````

✅ 步骤 5：结合crontab 上线
````
*/20 * * * * root /usr/sbin/logrotate /etc/logrotate.d/mysql-slow
````

📌 注意事项

如果删除了 mysql-slow.log或者轮转后的文件,那么必须手动 `mysqladmin -uroot -ptest351c042ae7_A flush-logs` 通知mysql