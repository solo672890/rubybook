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

## [MySQL慢查询](/service/mysql/mysql-slow)


## 完整配置
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
innodb_buffer_pool_size = 5G                 # 8GB内存分配5G给InnoDB缓存
innodb_buffer_pool_instances = 4             # 缓冲池实例数 = CPU核数
innodb_log_file_size = 1G                    # 增大日志文件减少检查点频率
innodb_log_files_in_group = 2                # 日志文件数
innodb_redo_log_capacity = 2G                # MySQL 8.4+ 推荐配置（覆盖旧参数）
innodb_flush_log_at_trx_commit = 2           # 折中配置：每秒刷盘，性能与安全平衡
innodb_log_buffer_size = 64M                 # 日志缓冲区大小
innodb_io_capacity = 2000                    # SSD优化（默认200，SSD可设2000）
innodb_io_capacity_max = 4000                # 最大I/O容量（SSD可用4000）
innodb_flush_method = O_DIRECT               # 直接IO，减少内存拷贝
innodb_file_per_table = 1                    # 每表独立表空间，便于管理
innodb_thread_concurrency = 0                # 自动调节线程数（0表示不限制）
innodb_adaptive_hash_index = OFF             # 禁用自适应哈希索引（MySQL 8.4默认关闭）

# =========================
# 连接与缓存配置
# =========================
max_connections = 300                        # 最大连接数（根据实际负载调整）
back_log = 100                               # 等待连接队列
table_open_cache = 4000                      # 打开表缓存
table_definition_cache = 2000                # 表定义缓存
thread_cache_size = 100                      # 线程缓存
tmp_table_size = 256M                        # 内存临时表大小
max_heap_table_size = 256M                   # 用户会话临时表大小
skip-name-resolve                          # 禁止DNS解析，提升连接速度

# =========================
# 查询与事务配置
# =========================
sort_buffer_size = 4M                      # 每个排序缓冲区大小
join_buffer_size = 4M                      # 每个JOIN缓冲区大小
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
innodb_max_dirty_pages_pct = 75            # 脏页比例（75%平衡刷新频率）
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

### innodb_flush_log_at_trx_commit

