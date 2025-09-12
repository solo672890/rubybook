---
releaseTime: 2024/5/31
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# 当执行一条insert|update mysql会做哪些事情
> 我认为,作为一个DBA,这些是必须要了解的知识

### 1️⃣ 图解

![explain](/document/will_do_demo1.png)


### 1️⃣ 客户端到服务器：SQL 接收与调度
1. 客户端把 SQL 语句通过协议发给 MySQL Server 进程。

2. Server端收到后,先进行词法解析、语法解析，校验SQL合法性并生成抽象语法树(AST)

3. 进入优化器阶段，MySQL 会根据表结构、索引统计信息，决定使用哪张索引、哪种执行计划。

4. 计划生成完毕，切换到执行引擎，准备走到存储引擎层去真正修改数据。


### 2️⃣ InnoDB 存储引擎的核心执行  

1.  加锁 / MVCC 可见性检查
* 插入前，InnoDB 会在插入位置（页、行）上加一个X 锁，保证并发事务互斥。

* 基于 MVCC，会检查当前事务隔离级别下，你对这条新记录是否可见。

2. 产生 Undo Log（事务回滚日志）
* 在修改页上写入Undo Log，Undo Log 保存在系统表空间（ibdata1）或独立 undo 表空间中。

* Undo Log 记录了“插入前数据的反向操作”（对新行而言，是标记删除），用于事务回滚。

3. 在 Buffer Pool 修改数据页
* 先把要写入的页从磁盘加载到内存缓冲池（Buffer Pool），

* 在内存页上插入新行，同时把该页标记为“脏页”，但并不立刻写回磁盘。

4. 产生 Redo Log（重做日志）
* InnoDB 会基于内存修改，生成对应的 Redo Log 记录写入重做日志缓冲区。

* 重做日志有两部分：

   * Redo Log Buffer(内存中，后续批量写入磁盘)

   * Redo Log Files(磁盘上，循环写入一系列 .log 文件)

### 3️⃣ Binlog 写入

* MySQL Server 在 InnoDB 修改完成后，会把这条 INSERT 语句或行级变化记录到Binlog Buffer
  
* 然后根据 sync_binlog 设置：

  * sync_binlog=1：立即 fsync() 将 Binlog Buffer 刷入磁盘；

  * 否则周期性或事务提交时才刷。

* Binlog 格式可选：STATEMENT、ROW、MIXED，决定记录 SQL 语句本身还是行级数据变化。

### 4️⃣ 事务提交（Commit）时刻

1. Server 收到 InnoDB “准备提交”信号后，开始二阶段提交：

   * Phase1：确保 Redo Log 和 Binlog 都已安全写入各自缓冲或磁盘（取决于配置）。

   * Phase2：写入事务表元信息，并释放锁。

* 若 innodb_flush_log_at_trx_commit=1，会在此刻把 Redo Log Buffer fsync() 到 Redo Log Files，保证崩溃不丢事务。

* 如果 =2 或 =0，则 Redo Log 可能只落到操作系统缓存，稍后才刷盘。

**此时，MySQL 对客户端返回“OK”，事务完成**

### 5️⃣后台刷脏页到磁盘

* Checkpoint 机制：InnoDB 后台 IO 线程会定期把 Buffer Pool 中的脏页写回到表空间（.ibd 文件）。

* 双写缓冲：为防止写半页断电损坏，InnoDB 先把脏页写到“双写缓冲区”，再批量写到目标文件。

* 当发生崩溃重启时，InnoDB 会先用 Redo Log replay 恢复未完成刷回的脏页，再应用 Undo Log 回滚未提交事务。

### 6️⃣ 日志写入时序图（简化版）

![explain](/document/will_do_demo2.png)


### 7️⃣ 小结

* Undo Log：在修改前生成，用于回滚。

* Redo Log：在修改后生成，用于崩溃恢复。

* Binlog：在事务中记录给从库/备份/审计。

* Buffer Pool：先在内存中修改，后台再落盘。

* 双写 + Checkpoint：保证数据页最终安全写入磁盘，并能在重启后恢复一致性