---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# MySQL服务器配置
> 服务器配置: 8核内存 , 100G_SSD , 4核CPU
> 
> 目标: 每天50万订单写入

## 👉[MySQL慢查询](/service/mysql/mysql-slow)


## 完整配置

::: warning
这份配置是按照mysql服务器配置来定制的,所谓mysql服务器即只有mysql作为服务,并不包含其他工具(redis,kafka等)运行,避免系统内存,硬盘,调度竞争.

如果是非mysql服务器,比如lnmp系统,则同样的系统配置下,要把这份mysql里的配置大小减半
:::

::: details 
````shell
sudo mkdir -p /var/log/mysql && sudo chown mysql:mysql /var/log/mysql 
sudo touch /var/log/mysql/mysql-slow.log && chmod 640 /var/log/mysql/mysql-slow.log
````
````shell
[mysqld]

# =========================
# InnoDB 核心配置（内存优化）
# =========================
innodb_buffer_pool_size = 4.5G                 # 8GB内存分配4.5G给InnoDB缓存
innodb_buffer_pool_instances = 4             # 缓冲池实例数 = CPU核数
innodb_log_file_size = 1G                    # 增大日志文件减少检查点频率
innodb_log_files_in_group = 2                # 日志文件数
innodb_redo_log_capacity = 2G                # MySQL 8.4+ 推荐配置（覆盖旧参数）
innodb_flush_log_at_trx_commit = 1           # 折中配置：每秒刷盘，性能与安全平衡
innodb_log_buffer_size = 256M                 # 日志缓冲区大小
innodb_io_capacity = 2000                    # SSD优化（默认200，SSD可设2000）
innodb_io_capacity_max = 4000                # 最大I/O容量（SSD可用4000）
innodb_flush_method = O_DIRECT               # 直接IO，减少内存拷贝
innodb_adaptive_hash_index = ON              # 自适应哈希索引（MySQL 8.4默认关闭）

# =========================
# 连接与缓存配置
# =========================
max_connections = 250                        # 最大连接数（根据实际负载调整）
back_log = 100                               # 等待连接队列
table_open_cache = 4000                      # 打开表缓存
table_definition_cache = 2000                # 表定义缓存
thread_cache_size = 100                      # 线程缓存
tmp_table_size = 128M                        # 内存临时表大小
max_heap_table_size = 128M                   # 用户会话临时表大小
skip-name-resolve                            # 禁止DNS解析，提升连接速度
wait_timeout = 300                           # 空闲连接超时时间（秒）
interactive_timeout = 300                    # 交互式连接超时时间

# =========================
# 查询与事务配置
# =========================
sort_buffer_size = 2M                      # 每个排序缓冲区大小
join_buffer_size = 2M                      # 每个JOIN缓冲区大小
read_buffer_size = 2M                      # 顺序读取缓冲区
read_rnd_buffer_size = 2M                  # 随机读取缓冲区
binlog_format = ROW                        # 二进制日志格式（ROW更安全）
sync_binlog = 1                            # 每事务同步日志（安全优先）
binlog_row_image = MINIMAL                 # 减少二进制日志体积
binlog_expire_logs_seconds = 604800        # 保留二进制日志7天
log_bin = mysql-bin                        # 启用二进制日志（主从复制）
log_replica_updates  = 1                   # 从库更新日志（主从链）
gtid_mode = ON                             # GTID模式（主从一致性）
enforce_gtid_consistency = ON              # 强制GTID一致性

# =========================
# 磁盘与文件系统优化
# =========================
default_tmp_storage_engine = MEMORY        # 临时表使用内存引擎
innodb_max_dirty_pages_pct = 50            # 脏页比例（50%平衡刷新频率）
innodb_max_dirty_pages_pct_lwm = 10        # 脏页低水位线
innodb_purge_threads = 4                   # 清理线程数（CPU核数）
innodb_change_buffer_max_size = 25         # 修改缓冲区大小（SSD可调低）
innodb_doublewrite = ON                    # 双写缓冲（保护数据）


# =========================
# 安全与监控
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
:::

## 配置解释

### innodb_buffer_pool_size 
[MySQL innodb_buffer_pool_size内存调优](https://cloud.tencent.com/developer/article/2537460)

>用于缓存数据和索引的内存大小,减少磁盘 I/O，提升查询速度.
>如果服务器只做数据库服务,最多设置到内存的60%,否则设置30%即可,
> 过大的buffer pool可能导致系统崩溃,内存占用也会超出预期
>该参数不要乱设置,如果mysql和其他服务同处于一台linux上,则不要设置过大,因为我已经崩溃过.
>本人多次测试,8G内存,最多只能将它设置为5G,多了要超出内存
>InnoDB 不是每次读写都直接操作磁盘，而是通过这个内存缓冲池来缓存：
>1. 数据页（Data Pages）：表中的行数据。
>1. 索引页（Index Pages）：B+树索引结构。
>1. 其他内部结构：如锁信息、自适应哈希索引等

### innodb_buffer_pool_instances 

>**作用:**  配合 `innodb_buffer_pool_size`,减少 Buffer Pool 锁争用，提升并发性能
>
>::: warning 官方建议
>每个实例至少 1GB，否则性能可能下降
>:::
>
>**✅如何工作**
>
>**假设:** innodb_buffer_pool_size = 8G  innodb_buffer_pool_instances = 8
>
>那么：
>
>* 每个实例大小 = 8G / 8 = 1GB
>* 每个实例独立管理自己的数据页、LRU 链表、锁等
>* 线程访问数据时，根据“页的哈希值”决定使用哪个实例
>* 🔍 哈希算法：InnoDB 使用页的表空间 ID 和页号进行哈希，决定该页属于哪个实例。
>
>**✅推荐配置原则**
>
>| 数据库规模 | 推荐比例 |  计算示例   |
> |:-----:|:----:|:-------:|
>| 8GB内存 | <60% | < 4.5GB |
>| 16GB  | 60%  |  10GB   |
>| >32GB | 70%  |  >22GB  | 

### innodb_log_file_size 
> ````
> 查询动态值
>SELECT @@innodb_log_file_size AS innodb_log_file_size_bytes,
>ROUND(@@innodb_log_file_size / (1024*1024*1024), 2) AS innodb_log_file_size_GB;
> ````
>**📌作用**
> * 控制InnoDB redlog文件大小,影响`写性能、恢复时间、并发能力`
> * InnoDB 通常有多个日志文件（默认是 2 个），由 innodb_log_files_in_group 控制。
> * total redlog日志空间 = innodb_log_file_size × innodb_log_files_in_group
>
>**✅核心作用:** 
> 
> 即使MySQL崩溃,只要Redo Log还在，就可以通过Redo Log来恢复未写入磁盘的数据
>InnoDB 使用 重做日志（Redo Log） 来保证事务的 持久性（Durability） 和 崩溃恢复能力。
>* 当你执行一个事务（如INSERT,UPDATE,DELETE）,InnoDB 会先将这些更改写入重做日志缓冲区（redo log buffer）。
>* 然后，这些日志会被写入磁盘上的 重做日志文件（redo log files）
>* 最终，数据页的更改会异步写入表空间（.ibd 文件）。
>
>**📌为什么这个参数很重要？** 
> 1. **影响写性能**
> * 较大的日志文件意味着 InnoDB 可以在不频繁“检查点（checkpoint）”的情况下缓存更多修改。
> * 减少磁盘 I/O，提高 INSERT/UPDATE 的吞吐量。
> * 但也不能太大，否则恢复时间会变长。
> 2. **影响崩溃恢复时间**
> * 日志越大，崩溃后需要重放的日志越多，恢复时间越长。
> * 例如：1GB 日志可能需要几分钟恢复，而 128MB 可能只需几秒。
> 3. **影响事务并发能力**
> * 大日志文件支持更高的并发写入，因为日志空间更充足，不容易“日志满”而阻塞写操作。
>
>**✅推荐配置原则**
>
>| 场景 |    建议值    |
> |:---------------:|:-------------:|
>|   小型应用（开发/测试）    |       64M ~ 128M      |
>|    中型应用（生产，一般负载）    |       256M ~ 512M       | 
>|      大型应用（高并发写入）      | 1G ~ 2G | 
>|      超大型应用（OLTP，高吞吐）      | 4G（需谨慎） | 
>
> **📌常见问题**
> 
>**❓为什么不能动态修改？**
> 
>* 因为日志文件大小在实例启动时就固定了，无法在运行时改变。
> 
>**❓日志文件太大有什么风险？**
> 
>* 崩溃恢复时间变长。
> 
>* 占用更多磁盘空间。
> 
>* 如果系统频繁崩溃，恢复过程可能影响业务可用性。
> 
>**❓日志文件太小有什么问题？**
> 
>* 频繁触发检查点，导致性能下降。
>* 可能出现 log file full 错误，阻塞写操作。
>::: danger 警告
>上线后再修改此值,修改前务必备份数据和日志文件。了解相关事宜
>:::

### innodb_redo_log_capacity  
<sapn class="marker-evy">默认值:100MB（104,857,600 字节）</sapn>

::: tip  
`innodb_redo_log_capacity`= `innodb_log_file_size * innodb_log_files_in_group`
MySQL8.0.30之前，InnoDB 的重做日志大小由 `innodb_log_file_size` 和 `innodb_log_files_in_group` 两个参数共同决定,
从 MySQL 8.0.30 开始，这两个参数被 标记为废弃（deprecated），取而代之的是`innodb_redo_log_capacity`
但是保留了兼容,如果同时设置了旧参数,那么 `innodb_redo_log_capacity`优先级更高
:::

>**动态查看和修改**
>````
>SELECT @@innodb_buffer_pool_size AS bytes,ROUND(@@innodb_buffer_pool_size / (1024 * 1024 * 1024), 2) AS GB;
>
># 注意：动态修改时，MySQL 会自动进行日志归档和重新分配，过程是 在线、非阻塞 的，但建议在低峰期操作
>SET GLOBAL innodb_redo_log_capacity = 2147483648; -- 2G
>````
>
>**使用**
> 自行参考 
> `innodb_log_file_size * innodb_log_files_in_group`


### innodb_flush_log_at_trx_commit

<sapn class="marker-evy">默认值:innodb_flush_log_at_trx_commit = 1</sapn>
>**📌一、作用**
> 
> **控制 InnoDB 的 redolog在事务提交时如何从内存刷新到磁盘**
> 
> **RedoLog 的作用**
> * InnoDB 使用 redo log 来保证事务的 持久性（Durability）。 当事务提交后，即使数据库崩溃，也可以通过 redo log 恢复已提交的事务。
> 
> **缓冲机制：**
> * Redo log 首先写入内存中的 log buffer，然后根据 innodb_flush_log_at_trx_commit 的设置决定何时刷新到磁盘。
>
>**✅总结**
>
>| 参数值  |     行为      |  安全   |     性能      |   场景   |
> |:---------------:|-----------|:-----:|:-----------:|:------:|
>| 1   | 每次提交都刷盘  | ✅ 最高  |❌ 最低| 金额类操作  |
>| 2  | 写入 OS 缓存，每秒刷盘 | ⚠️ 中等 |✅ 较高| 操作类志类  |
>| 0   |   每秒刷盘一次   | ❌ 最低  |✅ 最高| 操作类志类 |
>
> sync_binlog=1 + innodb_flush_log_at_trx_commit=1  最高安全性,牺牲性能
> 
> 
> sync_binlog=1000 + innodb_flush_log_at_trx_commit=2  高性能,适合用户操作类记录不敏感数据
> 
> **代码中未开启事务,也会触发吗❓**
> 
> 是的，即使你没有显式开启事务（即没有写 BEGIN 或 START TRANSACTION），
> 
> MySQL 也会自动将你的单条 DML 语句（如 INSERT、UPDATE、DELETE）当作一个 隐式事务（implicit transaction）
> 
> 所以，只要修改了数据，就会触发 redo log 的写入和刷新行为，
> 
> 并且这个行为仍然受 innodb_flush_log_at_trx_commit 控制。


### innodb_log_buffer_size

<sapn class="marker-evy">8.0+默认值:16m</sapn>
>**查询动态值**
> ````
>SELECT @@innodb_log_buffer_size AS innodb_log_buffer_size_bytes,
>ROUND(@@innodb_log_buffer_size / (1024*1024), 2) AS innodb_log_buffer_size_MB;
> ````
>**📌作用**
>
> * 作为 redolog写入磁盘前的内存缓冲区，减少频繁的磁盘 I/O,位于 MySQL 的内存中（RAM）
>
> **工作流程：**
> * 事务执行 UPDATE/INSERT/DELETE。
> * 修改产生的 redo log 被写入 InnoDB Log Buffer（内存）
> * 根据 innodb_flush_log_at_trx_commit 设置：决定何时刷盘
> * 最终由操作系统将数据写入磁盘上的 ib_logfile0 和 ib_logfile1
>
>**✅总结**
>
>| 场景  |     建议值| 
> |:---------------:|----------|
>| 普通应用   | 保持默认 16M |
>| 大量大事务	  | 64M ~ 256M | 
>| 高并发写入系统	   |  128M ~ 512M  |
>
>⚠️ 注意：不要设置过大（一般不超过 512M），否则：
>
>* 浪费内存
>* 在极端情况下（如崩溃恢复）可能导致恢复时间变长
>

### innodb_io_capacity

<sapn class="marker-evy">默认值:200</sapn>
>**查询动态值**
> ````
> SHOW VARIABLES LIKE 'innodb_io_capacity';
> ````
>**📌作用**
>
> * 告诉InnoDB后台任务可用的磁盘 I/O 能力，从而控制后台操作（如刷新脏页、合并插入缓冲）的执行速度
>
>**✅与innodb_io_capacity_max 的关系**
>
> * `innodb_io_capacity`：正常情况下的最大 I/O 容量。
> * `innodb_io_capacity_max`：在脏页积压严重时允许的峰值 I/O 容量。
> 
>**✅总结**
>
>| 存储类型	  |     建议值| 
> |:---------------:|----------|
>| 普通 SATA 机械硬盘（HDD）	   |200 ~ 500 |
>| SSD 固态硬盘		  | 2000 ~ 4000| 
>| 高性能 NVMe SSD		   |  8000 ~ 20000 或更高 |
>
>⚠️ 注意：不要盲目设置过高，防止 I/O 抢占前台查询
>
>* 浪费内存
>* 在极端情况下（如崩溃恢复）可能导致恢复时间变长
>

### innodb_flush_method

<sapn class="marker-evy">默认值:fdatasync</sapn>
>**查询动态值**
> ````
> SHOW VARIABLES LIKE 'innodb_flush_method';
> ````
>**📌作用**
>
> * 这个参数的设置直接影响数据库的性能（尤其是写入性能）和数据的安全性（在系统崩溃时的数据丢失风险）。不同的设置在不同的操作系统和硬件配置下表现差异很大。
>
>**✅可选值**
>
> * `fdatasync (默认值)`：适用于大多数通用场景，尤其是在文件系统元数据变更频繁或对数据一致性要求极高的环境。
> * `O_DSYNC`：较少使用，通常用于特定的性能测试或调试。
> * `O_DIRECT`：强烈推荐在具有足够内存和高性能磁盘（如 SSD）的生产环境中使用。
> * `O_DIRECT_NO_FSYNC`：仅用于特定的性能测试或对数据持久性要求不高的场景。绝不推荐在生产环境中使用。
> * `littlesync / nosync`：仅限于测试环境，绝对不能用于生产。
>
> **✅fdatasync 介绍:**
> * 这是最通用和最安全的设置。它确保了数据和元数据的完整性，但可能因为同步元数据而带来轻微的性能开
> * InnoDB 使用 fsync() 系统调用来刷新数据文件（.ibd），使用 fdatasync() 系统调用来刷新日志文件（ib_logfile*）。fsync() 和 fdatasync() 都会强制将文件数据和元数据（如文件大小、修改时间等）写入持久存储。
>
> **✅O_DIRECT 介绍:**
> * `避免双重缓冲`：InnoDB 自己管理缓冲池（Buffer Pool），如果操作系统再使用页面缓存，会造成内存的浪费（同一份数据在 Buffer Pool 和 Page Cache 中各有一份）
> * `减少上下文切换和内存拷贝`：绕过内核缓存可以减少系统调用的开销。
> * `要求更高的 I/O 带宽`：所有 I/O 都直接打到磁盘，对磁盘子系统的性能要求更高。
> * `可能增加磁盘 I/O`：如果操作系统缓存能有效命中，O_DIRECT 可能会增加实际的磁盘 I/O 量。
> 
>**✅总结**
> * innodb_flush_method 控制 InnoDB 的底层 I/O 刷新行为。
> * 默认值是 fdatasync，它安全且兼容性好。
> * `生产环境推荐 O_DIRECT` 通常是更好的选择，因为它避免了双重缓冲。
> * 选择哪个值取决于你的硬件（尤其是磁盘类型和内存大小）、性能需求和对数据安全性的要求。
> * 在更改此设置前，务必在测试环境中进行充分的评估。

### innodb_adaptive_hash_index

<sapn class="marker-evy">默认值:ON</sapn>
>**✅优点**
> 
> * SELECT * FROM orders WHERE order_no = 'ORD2025080001'; 这样的等值查询大幅提升性能
> * 缓存命中率高,减少 B+Tree 遍历
> * 只为热点数据创建哈希索引
> * 内存使用与访问频率成正比,不会无限增长
>
> **❌缺点**
>
> * `锁竞争问题`,AHI 使用全局锁,高并发(每秒)10,000+ 次等值查询时可能有问题
> * `内存开销`,哈希表占用额外内存,约为缓冲池的 5-10%,在 8GB 内存服务器上约 400-800MB
> * `维护开销`,数据变更时需同步更新哈希索引,高频写入场景可能影响性能

>**✅总结**
> * `生产环境开启`,利大于弊
> * `超高并发写入`,关闭
> * `读写分离`,读库开,写库关
> * `非读写分离`,开启它,利大于弊
>


### innodb_adaptive_hash_index

<sapn class="marker-evy">默认值:ON</sapn>
>**✅优点**
>
> * SELECT * FROM orders WHERE order_no = 'ORD2025080001'; 这样的等值查询大幅提升性能
> * 缓存命中率高,减少 B+Tree 遍历
> * 只为热点数据创建哈希索引
> * 内存使用与访问频率成正比,不会无限增长
>
> **❌缺点**
>
> * `锁竞争问题`,AHI 使用全局锁,高并发(每秒)10,000+ 次等值查询时可能有问题
> * `内存开销`,哈希表占用额外内存,约为缓冲池的 5-10%,在 8GB 内存服务器上约 400-800MB
> * `维护开销`,数据变更时需同步更新哈希索引,高频写入场景可能影响性能

>**✅总结**
> * `生产环境开启`,利大于弊
> * `超高并发写入`,关闭
> * `读写分离`,读库开,写库关
> * `非读写分离`,开启它,利大于弊
