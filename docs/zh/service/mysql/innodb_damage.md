---
releaseTime: 2025/4/25
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# 记一次innodb表损坏,修复的过程

> 某次使用脚本批量导入sql时,脚本意外中断,由于没有显式开启事务,导致索引损坏.
> mysql直接宕机了,也无法重启,所以这里记下这次的处理过程




## ✅排查现状
````
tail -f /var/log/mysqld.log
# 或者
journalctl -u mysqld -f
````

## ✅sql语句检查表索引是否损坏
````
CHECK TABLE orders_202508 QUICK;
````
或者
````
ANALYZE TABLE orders_202508;
````

## 我无法stop mysql

`systemctl stop mysqld`这个环节我卡得太久了,我选择`kill -p pid` 来进行结束MySQLd,但是失败了.

它会立即重启一个新的pid来工作.因为,系统用 systemd 管理 mysqld 服务，unit 文件里默认配置了 Restart=，只要进程非正常退出(如 kill -9)

因此你每次 kill -9 \<pid\>，systemd 都会认为服务挂掉了，于是立刻重新启动一个新进程。所以我需要屏蔽.

完全防止mysqld被任何方式启动: mask 会把 unit 链接到 /dev/null，任何启动命令都无效

`sudo systemtcl mask mysqld`  # unmask 解除

`sudo systemctl top mysqld`

## 至此我成功停止了mysql

## 我无法启动mysqld
**systemctl start mysqld 失败**

**systemctl status mysqld: Status: "InnoDB initialization in progress"**

::: details 原因
InnoDB 会检测到一次不干净的关机，需要做崩溃恢复（Crash Recovery）。这个流程包含两大阶段：

**重做日志（Redo Log）应用**

**回滚未提交事务（Undo Rollback）**

**InnoDB 就会花很长时间在磁盘上 replay 和 rollback，这时 systemctl status 会一直显示 “InnoDB initialization in progress”。**

:::


## 紧急情况下快速上线（读写但不保证完整回滚）
**innodb恢复时间很长,有张表单6000万条数据,几个小时了也没恢复好.正式线上不可能这么等待**

我采取了强制恢复模式,my.cnf 加入 `innodb_force_recovery = 3`
::: details innodb_force_recovery  命令解释
即使检测到损坏的页面，也允许服务器运行。尝试使 SELECT * FROM *tbl_name*跳过损坏的索引记录和页面，这有助于转储表。

2 (SRV_FORCE_NO_BACKGROUND)

阻止主线程和任何清除线程运行。如果在清除操作期间发生意外退出，则此恢复值会阻止它。

3 (SRV_FORCE_NO_TRX_UNDO)

崩溃恢复后不运行事务回滚.

4 (SRV_FORCE_NO_IBUF_MERGE)

阻止插入缓冲区合并操作。如果它们会导致崩溃，请不要这样做。不计算表统计信息。此值可能会永久损坏数据文件。使用此值后，请准备好删除并重新创建所有二级索引。将 InnoDB 设置为只读。

5 (SRV_FORCE_NO_UNDO_LOG_SCAN)

启动数据库时不查看撤消日志：InnoDB 甚至将未完成的事务视为已提交。此值可能会永久损坏数据文件。将 InnoDB 设置为只读。

6 (SRV_FORCE_NO_LOG_REDO)

不执行与恢复相关的重做日志前滚。此值可能会永久损坏数据文件。使数据库页处于过时状态，这反过来又可能会给 B 树和其他数据库结构带来更多损坏。将 InnoDB 设置为只读。

:::

## 至此我成功启动了mysqld

`sudo systemtcl mask mysqld` 先解除屏蔽,避免后面搞忘了.

索引损坏,那么肯定就要修复它.

`OPTIMIZE TABLE yourTable`我已经放弃这种方式来修复表.大表太慢了

::: details OPTIMIZE TABLE yourTable 命令解释
**作用**

回收磁盘空间：当你对表进行大量的删除、更新操作后，表中可能会出现很多空闲的空间碎片。OPTIMIZE TABLE 语句可以重新组织表的数据和索引存储，将这些碎片空间回收，减少表占用的磁盘空间。
提高查询性能：随着数据的增删改，表的数据和索引可能会变得碎片化，导致查询时磁盘 I/O 增加，性能下降。该语句通过重新整理数据和索引，使数据存储更加紧凑和有序，从而加快查询速度。
修复表的统计信息：MySQL 的查询优化器依赖表的统计信息来生成最优的查询执行计划。OPTIMIZE TABLE 会更新这些统计信息，帮助优化器做出更准确的决策。

**工作原理**

对于 MyISAM 存储引擎的表，OPTIMIZE TABLE 会创建一个临时表，将原表的数据和索引重新排序后插入到临时表中，然后删除原表，将临时表重命名为原表名。这个过程会彻底整理表的数据和索引，消除碎片。

对于 InnoDB 存储引擎的表，在 MySQL 5.6 及以后的版本中，`OPTIMIZE TABLE 实际上相当于执行 ALTER TABLE tbl_name ENGINE=InnoDB。它会重建表，通过创建一个新的 .ibd 文件来存储数据和索引，将原数据和索引复制到新文件中，然后删除原文件`。这个过程也能达到回收空间和整理数据的目的。


**适用场景**

频繁删除和更新数据的表：例如，在一个日志表中，经常会删除旧的日志记录，随着时间的推移，表中会产生大量的碎片，这时可以定期使用 OPTIMIZE TABLE 来整理表。

数据插入顺序混乱的表：如果数据是随机插入的，可能会导致数据和索引的存储不连续，影响查询性能。使用该语句可以使数据存储更加有序。

表的统计信息不准确的情况：当你发现查询性能突然下降，可能是由于表的统计信息过时，使用 OPTIMIZE TABLE 可以更新统计信息。
:::

于是我选择了手动备份数据,然后导入,mysql会自动重建索引

## 开始备份与恢复

[mysql备份](./backup)

## 成功恢复
问题排查+备份+恢复,耗时一个小时








