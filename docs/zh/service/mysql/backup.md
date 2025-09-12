---
releaseTime: 2025/5/23
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# mysql备份与恢复



## mysql备份

工具选型: [mysqldump](./backup#mysqldump) , [mydumper](./backup#mydumper),[percona xtrabackup](./backup#xtrabackup)


> **mydumper**
> 
> ✅ 多线程：多线程同时备份 , 
> 
> ✅ 高性能：充分利用多核 CPU,
> 
> ✅ 分表存储：自动分表,每个表独立文件,
> 
> ✅ 内置压缩：直接生成压缩文件,
> 
> ✅ 实时监控：显示备份进度,
> 
> ✅ myloader：多线程恢复工具
> 
> ✅ 内存友好：分批处理大表
> 
> ✅ 增量备份
> 
>  **mysqldump**
> 
> ✅ 随mysql自动安装,不需再手动安装 .
> 
>  **xtrabackup**
>
> ✅ 各方面都比上面两个工具优秀,性能好,适合中小企业使用

**个人结论**
就几百万条数据的小项目,小外包项目就直接mysqldump了吧.耗时都差不多,而且免得装工具

不要在这里说 MMA,MHA这样高可用架构备份,这不符合 《[RubyBook](/theory/whatsRubyBook)》的宗旨

## mysqldump



::: details mysqldump备份/导出指令

### 工具参数解释

````
# 不加这个参数,导入的时候会锁表,不阻塞线上业务
--single-transaction  --skip-lock-tables --skip-add-locks

# 逐行读取，边读边输出,内存占用低,适合大表
--quick

# mysql客户端/服务端通信压缩,减少网络传输数据量
--compress

# 不导出 GTID相关信息
# GTID 是 MySQL 主从复制中用于唯一标识事务的机制,默认 mysqldump 会导出 SET @@GLOBAL.GTID_PURGED = '...'，用于主从恢复.
# 仅做数据备份，不用于主从搭建
--set-gtid-purged=OFF

-u root -p my_test orders_202507

# 压缩成文件
| gzip > orders_202507_20250728.sql.gz

# 设置字符集
--default-character-set=utf8mb4

--add-drop-table
在每个 CREATE TABLE 语句前添加 DROP TABLE IF EXISTS table_name;

--routines
导出存储过程和函数,默认不导出

--triggers
导出触发器,默认开启

````



### 导出数据库

````bash
time mysqldump  --skip-lock-tables --skip-add-locks --single-transaction --quick  --compress --set-gtid-purged=OFF -u root -p my_test  | gzip > orders_202507_20250728.sql.gz
````

### 导出特定表
````bash
# 导出单个表
time mysqldump -u root -p my_database orders > orders.sql

# 导出多个表
time mysqldump -u root -p my_database orders users products > tables.sql
````

### 只导出表结构（不包含数据）
````bash
time mysqldump -u root -p --no-data my_database > structure_only.sql
````

### 只导出数据（不包含表结构）
````bash
time mysqldump -u root -p --no-create-info my_database users > data_only.sql
````

### 按条件导出数据
````bash
# 只导出最近30天的订单
time mysqldump -u root -p bot_game users --where="created_at >= '2025-03-01 01:25:41'" > test.sql

# 只导出特定状态的订单
time mysqldump -u root -p my_database orders --where="status = 'completed'" > completed_orders.sql
````

### 排除特定表
````bash
# 导出数据库但排除日志表
time mysqldump -u root -p bot_game --ignore-table=bot_game.logs --ignore-table=bot_game.temp_data > backup.sql
````

### 备份文件名(时间戳格式)
````bash
# 带时间戳的备份文件名
time mysqldump -u root -p my_database > my_database_$(date +%Y%m%d_%H%M%S).sql
````

### 定期备份脚本(自行写入crontab)
````bash
#!/bin/bash
# backup_mysql.sh

# 配置
BACKUP_DIR="/backup/mysql"
DB_USER="root"
DB_PASS="root"
DATABASE="bot_game"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
time mysqldump \
  -u $DB_USER \
  -p$DB_PASS \
  --quick \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  --default-character-set=utf8mb4 \
  --set-gtid-purged=OFF \
  --skip-lock-tables \
  --skip-add-locks \
  $DATABASE | gzip > "$BACKUP_DIR/${DATABASE}_$(date +%Y%m%d_%H%M%S).sql.gz"

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed at $(date)"
````

:::


::: details mysqldump 恢复/导入指令

### 恢复sql文件
````
# 恢复单个数据库
# -v -v -v 显示详细执行过程
mysql  -v  -u root -proot bot_game < my_database_backup.sql
````

### 恢复压缩备份-推荐
````
# 恢复 gzip 压缩的备份
gunzip < bot_game_20250828_211721.sql.gz | mysql  -u root -proot bot_game
# 带进度条
pv my_database_backup.sql.gz | gunzip | mysql -u root -p my_database
````

### 分拆大文件导入
````
split -B 100M my_database_backup.sql chunk_
for file in chunk_*; do
  mysql -u root -p my_database < "$file"
done
````
:::



## mydumper

::: details mydumper下载
````
https://github.com/mydumper/mydumper/releases

自行选择版本,切记要对应版本号
mydumper-0.19.4-8.(el7).x86_64.rpm => centos7
mydumper-0.19.4-8.(el8).x86_64.rpm => centos8
mydumper-0.19.4-8.(el9).x86_64.rpm => centos9

rpm -ivh xxxxxxxxx.rpm

mydumper --version
````
:::


::: details mydumper 备份/导出指令

### 备份/导出参数解释


 |         参数	          | 说明                                                                        | 示例                              |
 |:--------------------:|---------------------------------------------------------------------------|---------------------------------|
 |       --host	        | 数据库主机                                                                     | --host=localhost                |
 |       --user		       | 用户名                                                                       | --user=root                     |
 |     --password		     | 密码                                                                        | --password=123456               |
 |     --database		     | 指定数据库                                                                     | --database=orders               |
 |    --outputdir		     | 指定备份文件的输出目录                                                               | --outputdir=/backup             |
 |     --compress		     | 压缩输出                                                                      | --compress                      |
 |     --threads		      | 线程数   - 1CPU=1 OR 2                                                       | --threads=8                     |
 |      --rows		        | 每次查询行数 -分片,--rows=100000,即每 10 万行生成一个文件分片                                 | --rows=100000                   |
 |      --chunk-filesize		        | 控制每个分片文件最大为 512MB(单位:M),避免单个文件过大（如 >2GB 可能超出某些文件系统限制）                     | --chunk-filesize=512                   |
 |     --statement-size		      | 控制每个INSERT语句的大小(bytes)避免单条SQL太大,导入时max_allowed_packet超限                   | --statement-size=1000000                     |
 |     --logfile		      | 日志文件                                                                      | --logfile=/var/log/orders_db_$(date +%Y%m%d).log |
 |     --verbose		      | 设置日志详细程度,1:error,2:warning,✅3:info(推荐),4:debug,5:trace                    | --verbose=3                     |
 | --long-query-guard		 | 长查询保护,有查询已运行超过 30 秒，mydumper 的行为取决于 --kill-long-queries                   | --long-query-guard=60           |
 | --kill-long-queries		 | 备份开始前，扫描所有正在运行的查询,如果有查询 > 30 秒，mydumper 会执行 KILL QUERY \<id\> 将其终止,然后继续备份 | --kill-long-queries             |
 | --trx-consistency-only		 | 通过事务一致性确保备份数据的一致性，而无需对表加锁。此方法仅适用于 InnoDB 存储引擎 | --trx-consistency-only             |




### 导出|备份数据库

````bash
time mydumper \
  --host=localhost \
  --user=root \
  --password=test351c042ae7_A \
  --database=my_test \
  --outputdir=/backup/orders_full_$(date +%Y%m%d) \
  --compress \
  --verbose=3 \
  --trx-consistency-only \
  --threads=4 \
  --rows=100000 \
````
<details>
  <summary>点我展开-针对大databases</summary>
  
```` bash
time  mydumper \
  --host=localhost \
  --user=root \
  --password=test351c042ae7_A \
  --database=my_test \
  --outputdir=/backup/orders_full_$(date +%Y%m%d) \
  --compress \
  --threads=4 \
  --rows=500000 \
  --chunk-filesize=512 \
  --statement-size=1000000 \
  --trx-consistency-only \
  --long-query-guard=600 \
  --kill-long-queries \
  --verbose=3 \
  --logfile=/var/log/mydumper/orders_db_$(date +%Y%m%d).log
````

</details>


### 导出|备份特定表
````bash
# 导出单个表
time mydumper --host=localhost --user=root --password=test351c042ae7_A \
--database=my_test \
--tables-list="my_test.orders_202504,my_test.orders_202505" \
--outputdir=/backup/orders_full_$(date +%Y%m%d) \
--trx-consistency-only \
--verbose=3 \
--compress --threads=4
````

### 只备份表结构（无数据）
````bash
time mydumper \
  --host=localhost \
  --user=root \
  --password=your_password \
  --database=orders_db \
  --no-data \
  --verbose=3 \
  --outputdir=/backup/schema_only \
  --trx-consistency-only \
  --threads=2
````
### 只备份数据（无表结构）
````bash
time mydumper \
  --host=localhost \
  --user=root \
  --password=your_password \
  --database=orders_db \
  --no-schemas \
  --outputdir=/backup/data_only \
  --trx-consistency-only \
  --compress \
  --verbose=3 \
  --threads=4
````



### 备份脚本
````
#!/bin/bash
# backup_orders.sh

BACKUP_DIR="/backup/orders_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/mydumper/backup_$(date +%Y%m%d).log"
DATABASE="orders_db"
USER="backup_user"
PASSWORD="your_password"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
time mydumper \
  --host=localhost \
  --user=$USER \
  --password=$PASSWORD \
  --database=$DATABASE \
  --outputdir=$BACKUP_DIR \
  --compress \
  --trx-consistency-only \
  --threads=6 \
  --verbose=3 \
  --rows=100000 \
  --long-query-guard=60 \
  --kill-long-queries \
  --logfile=$LOG_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "$(date): 备份成功: $BACKUP_DIR" >> $LOG_FILE
    
    # 清理7天前的备份
    find /backup -name "orders_*" -type d -mtime +7 -exec rm -rf {} \;
else
    echo "$(date): 备份失败" >> $LOG_FILE
    # 可选：发送告警
fi
````
:::


::: details 增量备份
经调查和实践,mydumper的增量备份是伪增量,兼容使用 percona xtrabackup进行增量备份
:::


::: details myloader 恢复/导入
### 恢复/导入参数解释


|              参数	               | 说明                                                     | 示例                                                      |
 |:------------------------------:|--------------------------------------------------------|---------------------------------------------------------|
|            --host	             | 数据库主机                                                  | --host=localhost                                        |
|            --user		            | 用户名                                                    | --user=root                                             |
|          --password		          | 密码                                                     | --password=123456                                       |
|          --database		          | 指定数据库                                                  | --database=orders                                       |
|         --directory		          | 指定备份文件的输出目录                                            | --outputdir=/backup                                     |
|          --compress		          | 压缩输出                                                   | --compress                                              |
|          --threads		           | 线程数   - 1CPU=1 OR 2                                    | --threads=8                                             |
|          --verbose		           | 设置日志详细程度,1:error,2:warning,✅3:info(推荐),4:debug,5:trace | --verbose=3                                             |
|      --drop-table		      | 如果目标数据库中存在同名表，则删除旧表并重新创建                               | --drop-table                                      |
|  --queries-per-transaction		   | 每个事务中包含 1000 条 INSERT 语句 后提交一次                         | --queries-per-transaction=1000                          | 
|          --logfile		           | 日志记录文件                                                 | --logfile=/var/log/mydumper/orders_db_$(date +%Y%m%d).log | 
|         --drop-table		         | 对每个表执行 DROP TABLE IF EXISTS       | --drop-table           | 

### 恢复数据库(覆盖)
````

time myloader \
  --host=localhost \
  --user=root \
  --password=test351c042ae7_A  \
  --database=my_test \
  --directory=/backup/orders_full_20250904 \
  --queries-per-transaction=1000 \
  --verbose=3 \
  --threads=4 \
  --drop-table
````
### 恢复特定表(覆盖)
```` bash
time myloader \
  --host=localhost \
  --user=root \
  --password=test351c042ae7_A  \
  --database=my_test \
  --tables-list="my_test.orders_202507" \
  --directory=/backup/orders_full_20250904 \
  --queries-per-transaction=1000 \
  --verbose=3 \
  --threads=4 \
  --drop-table  
````
:::


### 记一次大表导出备份耗时
```` bash{1,32}
# 系统配置:8GB内存 4CPU SSD
# 9千万条数据,大小8.8GB

** Message: 10:27:10.179: MyDumper backup version: 0.19.4-8
** (mydumper:238343): WARNING **: 10:27:10.180: Using --trx-tables options, binlog coordinates will not be accurate if you are writing to non transactional tables.
** Message: 10:27:10.185: Connected to MySQL 8.4.6
** Message: 10:27:10.185: Started dump at: 2025-08-29 10:27:10
...
...
** Message: 10:30:51.011: Main connection closed
** Message: 10:30:51.018: Finished dump at: 2025-08-29 10:30:51

real	3m40.857s
user	3m1.641s
sys	    0m21.429s

 
耗时 3m40.857s
````
### 记一次大表恢复导入耗时 
```` bash{1,12}
# 系统配置:8GB内存 4CPU SSD
# 9千万条数据,大小8.8GB

[root@ip-172-31-16-200 software]# myloader   --host=localhost   --user=root   --password=test351c042ae7_A   --database=my_test   --directory=/backup/orders_full_$(date +%Y%m%d)   --threads=4   --drop-table   --verbose=3
** Message: 00:32:39.593: Using 4 loader threads
...
...
** Message: 01:10:30.745: Thread 13: Starting post import task over table
** Message: 01:10:30.745: Restore completed

耗时 38min
````


## xtrabackup

有空再来更新







