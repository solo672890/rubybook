---
releaseTime: 2024/8/21
original: true
prev: false
next: false
editLink: true
---
# Mysql
<style src="/.vitepress/theme/style/nav.css"></style>


## 文档
<script setup>
const DATA=[
    {
        title: '',
        items: [
            {
                icon: 'https://labs.mysql.com/common/logos/mysql-logo.svg?v2',
                title: '官方文档',
                desc: '以更快的速度、内存和准确性构建 AI 应用程序',
                link: 'https://dev.mysql.com/doc/refman/8.4/en/linux-installation-yum-repo.html'
            },
            {
                icon: 'https://wiki.echo.cool/resources/assets/logo.png',
                title: '代码酷',
                desc: '免费好用的编程语言框架教程网站，学习编程就上代码酷！',
                link: 'https://www.echo.cool/docs/database/mysql/'
            },
        ]
    },
]
</script>

<MNavLinks v-for="{title, items} in DATA" :title="title" :items="items"/>


<br>

## 安装
::: details
<br>
如果要集群部署或者测试,还是docker比较方便,建议用docker

1 创建mysql用户组
````
groupadd mysql    #创建mysql
useradd -r -g mysql mysql    #增加mysql用户并让它属于mysql用户组
````

2.安装必备包
````
yum -y install libaio
yum install openssl-devel
````


3. 查询是否安装 mariadb 避免冲突
````
rpm -qa | grep mariadb                  yum -y remove mariadb*
rpm -qa | grep -i mysql   # -i 忽略大小写                 
yum -y remove mysql* # 删除旧版,如果有
find / -name mysql    #找到相关的自行删除
rm -rf /etc/my.cnf.d
````
4.开始安装 mysql8.4
`yum不一定会安装到自己想要的版本,所以这里选择了 rpm安装 mysql8.4`

`介绍得非常仔细,如果要安装其他版本,自行举一反三`

`其他系统和mysql其他版本安装方法是一样的,只不过rpm安装的包名不一样`
<a href="/document/mysql_download.png" target="_blank">
💾 mysql版本,系统选择示例
</a>

::: details 点我查看


::: code-group

```` bash [yum安装]
# 下载rpm
wget https://repo.mysql.com//mysql84-community-release-el9-2.noarch.rpm

# 避免yum依赖的软件和环境不是最新的
yum update

# 安装mysql源
sudo yum localinstall -y mysql84-community-release-el9-2.noarch.rpm

# 检查 MySQL Yum 存储库是否已 通过以下命令成功添加并启用
yum repolist enabled | grep mysql.*-community

# 检查是否是指定版本生效了
yum repolist all | grep mysql

# yum 源安装完成后，正式安装 mysql服务端
yum install -y mysql-community-server
# 安装 mysql客户端
yum install -y mysql-community-client

# 查看是否成功安装
systemctl start mysqld && systemctl enable mysqld

### 开始权限分组
chown mysql:mysql /var/lib/mysql -R;

获取初始化密码（密码在输出的最后面）
cat /var/log/mysqld.log | grep password

会输出:
[Server] A temporary password is generated for root@localhost: l2MVlf626s.y
l2MVlf626s.y  这就是你的密码

````


```` bash [rpm安装]
需要事先安装
sudo dnf install perl &&  sudo dnf install libtirpc &&  sudo dnf install net-tools

mkdir -p ~/software/mysql  2选1
# 官网下载地址 ：https://downloads.mysql.com/archives/community/。
# 下载参考 : ⬆⬆

# 也可以选择从链接去下载并解压, 2选1
wget https://cdn.mysql.com/archives/mysql-8.4/mysql-8.4.5-1.el9.x86_64.rpm-bundle.tar
tar -xvf mysql-8.4.5-1.el9.x86_64.rpm-bundle.tar

#安装rpm
# 核心必需包,且请安顺序安装

# 提供 MySQL 的公共文件和基础库（如字符集、ICU 数据等）。
rpm -ivh mysql-community-common-8.4.5-1.el9.x86_64.rpm
# 包含客户端插件（如认证插件）。
rpm -ivh mysql-community-client-plugins-8.4.5-1.el9.x86_64.rpm 
# 包含 MySQL 运行时依赖的核心库（如 libmysqlclient.so）。
rpm -ivh mysql-community-libs-8.4.5-1.el9.x86_64.rpm
# 提供 mysql 命令行客户端工具，用于连接和管理数据库
rpm -ivh mysql-community-client-8.4.5-1.el9.x86_64.rpm
# 如果数据库需要处理非 ASCII 字符（如中文、日文等）。提供 ICU（国际组件）数据文件，支持多语言字符集
rpm -ivh mysql-community-icu-data-files-8.4.5-1.el9.x86_64.rpm
# MySQL 服务的核心组件（包含 mysqld 和初始化脚本）
rpm -ivh mysql-community-server-8.4.5-1.el9.x86_64.rpm
# 提供兼容旧版本的库文件（如 libmysqlclient.so.18）
rpm -ivh mysql-community-libs-compat-8.4.5-1.el9.x86_64.rpm


# 生产模式下,不要安装,他们用于测试和调试mysql内部情况
mysql-community-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-debugsource-8.4.5-1.el9.x86_64.rpm
mysql-community-client-debuginfo-8.4.5-1.el9.x86_64.rpm    
mysql-community-client-plugins-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-devel-8.4.5-1.el9.x86_64.rpm
mysql-community-libs-compat-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-libs-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-server-debug-8.4.5-1.el9.x86_64.rpm
mysql-community-server-debug-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-server-debuginfo-8.4.5-1.el9.x86_64.rpm
mysql-community-test-8.4.5-1.el9.x86_64.rpm
mysql-community-test-debuginfo-8.4.5-1.el9.x86_64.rpm



查看安装列表，上面几个安装了没有
rpm -qa | grep mysql


### 至此,安装完成


### 初始化，并忽略表名大小写

mysqld --initialize --user=mysql --lower-case-table-names=1
执行 systemctl status mysqld.service  
如果报错就手写 'lower-case-table-names=1' 进my.cnf
vim /etc/my.cnf
在[mysqld]里加入
lower-case-table-names=1


### 开始权限分组

chown mysql:mysql /var/lib/mysql -R;
# 开机自启
systemctl start mysqld && systemctl enable mysqld
获取初始化密码（密码在输出的最后面）
cat /var/log/mysqld.log | grep password

会输出:
[Server] A temporary password is generated for root@localhost: l2MVlf626s.y
l2MVlf626s.y  这就是你的密码
````

:::



## 卸载mysql
````
yum -y remove mysql* # 删除旧版,如果有
#一定要检查是否卸载干净没有,泪的教训,|rpm -qa | grep -i mysql (卸载不干净就用dnf卸载)
rpm -qa | grep -i mysql
find / -name mysql    #找到相关的自行删除
rm -rf /etc/my.cnf.d
````

## 登录mysql并修改密码
````
mysql -u root -p
# 让root用户在本地连接时,使用该密码,进行登录
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'test351c042ae7_A';
flush privileges;
# 重置完成
````

## 开始远程授权
````
# 创建muyu用户,用户可以从任意ip(%代表任意ip)登录
CREATE USER  'muyu'@'%'  IDENTIFIED BY  'test351c042ae7_A';

# 把所有数据库+所有表的权限都给 muyu
grant all privileges on *.* to 'muyu'@'%' with grant option;

flush privileges;
use mysql;
select host,user from user;
远程链接 要注意防火墙
````

## 更改远程连接端口
````
vim /etc/my.cnf
[mysqld]
port=33445

systemctl restart mysqld
````
## 👉[MySQL慢查询](/service/mysql/mysql-slow)
## 👉[MySQL服务器配置](/service/mysql/config)
## 👉[备份与恢复](/service/mysql/backup)

## mysql监控
::: details 查看
### 查看允许的最大连接数(客户端同时请求)
````
show variables like '%max_connection%';
````
### 查看当前已建立的连接数(即活跃连接数)
````
show global status like 'Threads_connected';
````

### 查看占用的总内存
````
SELECT * FROM sys.memory_global_total;
````

### 查看具体占用的内存
````
SELECT 
    SUBSTRING_INDEX(event_name, '/', 2) AS memory_layer,
    ROUND(SUM(CURRENT_NUMBER_OF_BYTES_USED) / 1048576, 2) AS bytes_used_mb
FROM 
    performance_schema.memory_summary_global_by_event_name
GROUP BY 
    memory_layer
ORDER BY 
    bytes_used_mb DESC;
````

### 查看某库占地面积
````
SELECT 
    table_schema AS 'xxxxx',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS '大小(MB)'
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'xxxxx'  
GROUP BY 
    table_schema;
````

### 连接健康查看
````
# 如果大于0.8 表示压力有点大了,应该要触发警告
const res=Threads_connected / max_connections
if(res > 0.8){
    //todo 触发警报
}
````
### 找出阻塞时间超过 30 秒的“锁等待”关系
`谁（阻塞线程）执行了什么 SQL（阻塞SQL）,导致谁（被阻塞线程）的 SQL（被阻塞SQL）被卡住,已经阻塞了多久（阻塞时间，单位：秒）`
````
SELECT 
  r.trx_mysql_thread_id AS '被阻塞线程',
  r.trx_query AS '被阻塞SQL',
  b.trx_mysql_thread_id AS '阻塞线程',
  b.trx_query AS '阻塞SQL',
  ROUND(TIME_TO_SEC(TIMEDIFF(NOW(), b.trx_started)), 0) AS '阻塞时间(秒)'
FROM 
  performance_schema.data_lock_waits w
JOIN information_schema.innodb_trx b ON w.BLOCKING_ENGINE_TRANSACTION_ID = b.trx_id
JOIN information_schema.innodb_trx r ON w.REQUESTING_ENGINE_TRANSACTION_ID = r.trx_id
WHERE 
  TIME_TO_SEC(TIMEDIFF(NOW(), b.trx_started)) > 30;
  
//   SHOW ENGINE INNODB STATUS;
//  在输出中查找 TRANSACTIONS 部分，会显示：'当前运行的事务','锁等待信息','阻塞关系'
````
###  锁等待超时时间(InnoDB存储引擎)
`谁（阻塞线程）执行了什么 SQL（阻塞SQL）,导致谁（被阻塞线程）的 SQL（被阻塞SQL）被卡住,已经阻塞了多久（阻塞时间，单位：秒）`
````
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';
//输出 innodb_lock_wait_timeout=50 表示InnoDB 锁等待的超时时间为 50 秒,超过就会被中断
//高并发场景要调至10秒,快速释放锁.
//如果执行长事务,比如所有的代理和会员月结算,要调至60秒及以上,避免正常操作被误杀
````
###  当前正在执行的线程数量/数据库并发请求的数量
````
show global status LIKE    'Threads_running';
````
###  获取有性能问题的sql
````
SELECT id,user,host,DB,command, time,state,info FROM information_schema.PROCESSLIST WHERE TIME>=60;

# 主要用于 性能监控和故障排查，例如：
    找出慢查询（Long-running Queries）,time >= 60 且 command = 'Query' 的连接，可能是慢 SQL。查看 info 字段，确认是哪个 SQL 执行太久。
# 发现空闲连接（Idle Connections）    
    command = 'Sleep' 且 time 很大（如几小时），说明应用未正确关闭连接，可能导致连接池耗尽。
# 识别阻塞或锁等待
    state = 'Locked' 或 Waiting for table metadata lock，可能表示锁竞争
# 终止长时间运行的连接（谨慎操作）    
    KILL 123; -- 终止 ID 为 123 的连接
````

:::


## 压测
`使用 Sysbench 压测,测试环境:30G_SSD  8G内存 2CPU aws云服务器`
::: details 点我查看

::: code-group


```` sh [测试前]
yum -y install Sysbench

# 创建测试数据库
mysql -u root -p -e "CREATE DATABASE sbtest;"

# 测试前修改配置
vim /etc/my.cnf

[mysqld]
# 允许的最大用户连接数（可选，默认等于 max_connections） # 0 表示无限制
max_user_connections = 0  
# 打开表的缓存，高并发时也需要调大
table_open_cache = 4000
# 线程缓存，减少频繁创建销毁线程的开销
thread_cache_size = 100
# mysql最大连接
max_connections = 1200
# 预处理语句数量,客户端请求时,大约每个预处理语句会占用3kb内存,提高重复查询性能、减少网络传输
max_prepared_stmt_count = 50000
# 用于缓存数据和索引的内存大小,如果服务器只做数据库服务,可以设置到内存的75%,否则设置50%即可,过大的buffer pool可能导致系统崩溃
# 该参数不要乱设置,如果mysql和其他服务同处于一台linux上,则不要设置过大,因为我已经崩溃过.
innodb_buffer_pool_size=6G

# 系统资源检查
ulimit -n
# 如果小于4096,建议调大,
vim /etc/security/limits.conf
mysql soft nofile 65536
mysql hard nofile 65536

# 确保mysql服务端也配置了限制
find / -name mysqld.service  # /usr/lib/systemd/system/mysqld.service
vim /usr/lib/systemd/system/mysqld.service
[Service]
LimitNOFILE=65536


# 重启
 systemctl restart mysqld
````

```` sh [开始测试]
# 此命令将创建 10 张表，每张表包含 1000000 条记录。
sysbench \
  --db-driver=mysql \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=test351c042ae7_A \
  --mysql-db=sbtest \
  --tables=10 \
  --table_size=1000000 \
  oltp_read_write prepare

# 混合读写测试,模拟200个虚拟客户端同时发起请求,持续60s
# oltp_read_write 读写混合模式   
    # oltp_point_select    只做主键查询                               测试QPS,缓存性能
    # oltp_write_only      混合写操作,无读(INSERT+UPDATE+DELETE)      写性能、I/O 压力测试
    # oltp_insert          仅执行 INSERT                             插入吞吐、日志写入测试
    # oltp_read_write      读写混合（默认）                            综合 OLTP 性能评估

# --threads=200              模拟200个并发线程连接,启动 200 个工作线程 
# --report-interval          每 x 秒报告一次中间结果
# 持续测试120s

sysbench \
  --db-driver=mysql \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=test351c042ae7_A \
  --mysql-db=sbtest \
  --tables=10 \
  --table_size=1000000 \
  --threads=100 \
  --time=60 \
  --report-interval=10 \
  oltp_point_select run
````

```` sh [混合读写测试]
#  tps(每秒处理事务的数量): 503.16 - 544.37,
[ 10s ] thds: 100 tps: 503.16 qps: 10204.60 (r/w/o: 7154.94/2033.44/1016.22) lat (ms,95%): 297.92 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 100 tps: 538.82 qps: 10773.29 (r/w/o: 7554.44/2141.10/1077.75) lat (ms,95%): 292.60 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 100 tps: 539.00 qps: 10763.86 (r/w/o: 7529.67/2156.49/1077.70) lat (ms,95%): 272.27 err/s: 0.00 reconn/s: 0.00
[ 40s ] thds: 100 tps: 556.70 qps: 11178.07 (r/w/o: 7821.98/2242.59/1113.50) lat (ms,95%): 272.27 err/s: 0.00 reconn/s: 0.00
[ 50s ] thds: 100 tps: 540.20 qps: 10771.55 (r/w/o: 7544.53/2146.61/1080.40) lat (ms,95%): 267.41 err/s: 0.00 reconn/s: 0.00
[ 60s ] thds: 100 tps: 533.20 qps: 10693.02 (r/w/o: 7479.02/2147.40/1066.60) lat (ms,95%): 262.64 err/s: 0.00 reconn/s: 0.00
[ 70s ] thds: 100 tps: 540.40 qps: 10785.69 (r/w/o: 7550.10/2154.90/1080.70) lat (ms,95%): 267.41 err/s: 0.00 reconn/s: 0.00
[ 80s ] thds: 100 tps: 545.20 qps: 10894.29 (r/w/o: 7631.09/2172.80/1090.40) lat (ms,95%): 277.21 err/s: 0.00 reconn/s: 0.00
[ 90s ] thds: 100 tps: 528.00 qps: 10581.59 (r/w/o: 7401.89/2123.70/1056.00) lat (ms,95%): 308.84 err/s: 0.00 reconn/s: 0.00
[ 100s ] thds: 100 tps: 546.80 qps: 10919.42 (r/w/o: 7648.51/2177.30/1093.60) lat (ms,95%): 287.38 err/s: 0.00 reconn/s: 0.00
[ 110s ] thds: 100 tps: 546.40 qps: 10949.99 (r/w/o: 7660.10/2197.10/1092.80) lat (ms,95%): 282.25 err/s: 0.00 reconn/s: 0.00
[ 120s ] thds: 100 tps: 544.37 qps: 10885.47 (r/w/o: 7622.43/2174.39/1088.65) lat (ms,95%): 282.25 err/s: 0.00 reconn/s: 0.00
SQL statistics:
    queries performed:
        read:                            906108     # 120秒产生的查询次数   
        write:                           258888     # 120秒产生的写入次数  
        other:                           129444     # 120秒产生的其他操作,比如commit
        total:                           1294440
    transactions:                        64722  (538.59 per sec.)       # 总事务数64722,每秒538.59
    queries:                             1294440 (10771.78 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

General statistics:
    total time:                          120.1679s
    total number of events:              64722

Latency (ms):
         min:                                    6.14       # 最小延迟 毫秒
         avg:                                  185.52       # 平均延迟 毫秒
         max:                                  788.61       # 最大延迟 毫秒
         95th percentile:                      282.25       # 95%延迟均 ≤ 282.25毫秒
         sum:                             12007326.09

Threads fairness:
    events (avg/stddev):           647.2200/8.58
    execution time (avg/stddev):   120.0733/0.05

总结:该mysql服务器在100虚拟客户端下,能极限处理544.37个事务
建议日常控制在 80%的事务左右(即435),
不要让系统长期过载

````
````sh[写入测试]
[ 10s ] thds: 100 tps: 2099.08 qps: 12633.58 (r/w/o: 0.00/8425.62/4207.96) lat (ms,95%): 74.46 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 100 tps: 2161.38 qps: 12973.75 (r/w/o: 0.00/8651.10/4322.65) lat (ms,95%): 71.83 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 100 tps: 2251.01 qps: 13504.25 (r/w/o: 0.00/9001.93/4502.32) lat (ms,95%): 69.29 err/s: 0.00 reconn/s: 0.00
[ 40s ] thds: 100 tps: 2154.59 qps: 12908.66 (r/w/o: 0.00/8599.47/4309.19) lat (ms,95%): 74.46 err/s: 0.00 reconn/s: 0.00
[ 50s ] thds: 100 tps: 2251.39 qps: 13530.76 (r/w/o: 0.00/9028.08/4502.69) lat (ms,95%): 75.82 err/s: 0.00 reconn/s: 0.00
[ 60s ] thds: 100 tps: 2184.49 qps: 13107.94 (r/w/o: 0.00/8739.36/4368.58) lat (ms,95%): 73.13 err/s: 0.00 reconn/s: 0.00
[ 70s ] thds: 100 tps: 2149.62 qps: 12879.79 (r/w/o: 0.00/8580.06/4299.73) lat (ms,95%): 74.46 err/s: 0.00 reconn/s: 0.00
[ 80s ] thds: 100 tps: 2202.30 qps: 13232.09 (r/w/o: 0.00/8827.60/4404.50) lat (ms,95%): 71.83 err/s: 0.00 reconn/s: 0.00
[ 90s ] thds: 100 tps: 2091.13 qps: 12522.16 (r/w/o: 0.00/8339.91/4182.25) lat (ms,95%): 75.82 err/s: 0.00 reconn/s: 0.00
[ 100s ] thds: 100 tps: 2093.28 qps: 12568.49 (r/w/o: 0.00/8382.03/4186.46) lat (ms,95%): 75.82 err/s: 0.00 reconn/s: 0.00
[ 110s ] thds: 100 tps: 2099.62 qps: 12587.90 (r/w/o: 0.00/8388.86/4199.03) lat (ms,95%): 74.46 err/s: 0.00 reconn/s: 0.00
[ 120s ] thds: 100 tps: 2062.70 qps: 12395.60 (r/w/o: 0.00/8270.00/4125.60) lat (ms,95%): 73.13 err/s: 0.00 reconn/s: 0.00
SQL statistics:
    queries performed:
        read:                            0
        write:                           1032436
        other:                           516218
        total:                           1548654
    transactions:                        258109 (2149.52 per sec.)
    queries:                             1548654 (12897.13 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

General statistics:
    total time:                          120.0758s
    total number of events:              258109

Latency (ms):
         min:                                    3.62
         avg:                                   46.50
         max:                                  205.64
         95th percentile:                       74.46
         sum:                             12002149.31

Threads fairness:
    events (avg/stddev):           2581.0900/17.52
    execution time (avg/stddev):   120.0215/0.02
````
````sh[查询测试]
[ 10s ] thds: 100 tps: 18248.20 qps: 18248.20 (r/w/o: 18248.20/0.00/0.00) lat (ms,95%): 7.70 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 100 tps: 18874.10 qps: 18874.10 (r/w/o: 18874.10/0.00/0.00) lat (ms,95%): 6.32 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 100 tps: 18811.80 qps: 18811.80 (r/w/o: 18811.80/0.00/0.00) lat (ms,95%): 6.67 err/s: 0.00 reconn/s: 0.00
[ 40s ] thds: 100 tps: 18552.74 qps: 18552.74 (r/w/o: 18552.74/0.00/0.00) lat (ms,95%): 6.91 err/s: 0.00 reconn/s: 0.00
[ 50s ] thds: 100 tps: 18733.95 qps: 18733.95 (r/w/o: 18733.95/0.00/0.00) lat (ms,95%): 6.67 err/s: 0.00 reconn/s: 0.00
[ 60s ] thds: 100 tps: 18658.90 qps: 18658.90 (r/w/o: 18658.90/0.00/0.00) lat (ms,95%): 6.79 err/s: 0.00 reconn/s: 0.00
SQL statistics:
    queries performed:
        read:                            1119259
        write:                           0
        other:                           0
        total:                           1119259
    transactions:                        1119259 (18642.56 per sec.)
    queries:                             1119259 (18642.56 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

General statistics:
    total time:                          60.0363s
    total number of events:              1119259

Latency (ms):
         min:                                    0.06
         avg:                                    5.36
         max:                                  414.12
         95th percentile:                        6.79
         sum:                              5998772.61

Threads fairness:
    events (avg/stddev):           11192.5900/100.86
    execution time (avg/stddev):   59.9877/0.01

````


````sh[清理测试数据]

sysbench \
  --db-driver=mysql \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=test351c042ae7_A \
  --mysql-db=sbtest \
  oltp_read_write \
  cleanup
````
:::

## sql性能测试
`环境 redhat9 4核8g 30g_ssd aws云服务器`

### 👉[explain](/service/mysql/explain)

### 附带一个php批量插入数据的脚本
::: details
````
CREATE TABLE `orders_202409` (
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
  UNIQUE KEY `order_no` (`order_no`) USING BTREE,
  KEY `from_id` (`from_id`) USING BTREE,
  KEY `created_at` (`created_at`,`sale_status`) USING BTREE,
  KEY `plat_form_order` (`plat_form_order`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='卖单订单表';
````

````
<?php
namespace app\command;
use support\Db;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
class TestMysql extends Command
{
    protected static $defaultName = 'testMysql';
    protected static $defaultDescription = 'Mysql analysis';
    protected array $insertData ;
    /**
     * @return void
     */
    protected function configure()
    {
        $this->addArgument('name', InputArgument::OPTIONAL, 'Name description');
    }
    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $name = $input->getArgument('name');
        $this->insertData=[];
        $start_time = microtime(true);
        $startMemory = memory_get_usage();
        $arr=['orders_202508'];
        for ($i = 0; $i < 1; $i++) {

            $this->test1($arr[$i]);
        }
        $this->debugFn(sprintf("耗时： %f秒<br>", round(microtime(true)-$start_time,3)));
        $this->debugFn(sprintf("内存使用: %f kb<br>", (memory_get_usage() - $startMemory) / 1024));
        return self::SUCCESS;
    }


    private function test1($orderTable) {
        // 总插入次数
        $totalBatches = 1;
        $batchesPerInsert = 1; // 每次插入 1 万条
        try {
            for ($batch = 1; $batch <= $totalBatches; $batch++) {
                $values = [];
                $currentTime = date('Y-m-d H:i:s'); // 当前时间作为基础
                for ($i = 0; $i < $batchesPerInsert; $i++) {
                    $orderNo = date('YmdHis') . substr(microtime(), 2, 6) . sprintf('%03d', rand(0, 999));
                    $fromId = rand(1, 1000); // 卖家 ID 范围 1-1000
                    $saleStatus = ['start', 'trade_ing', 'trade_cancel', 'trade_stop', 'trade_finish'][rand(0, 4)];
                    // 随机生成 created_at 时间（当前时间 ± 30 天）
                    $createdAt = date('Y-m-d H:i:s', strtotime($currentTime) + rand(-30 * 86400, 30 * 86400));
                    // 生成 notify_url 和 plat_form_order
                    $notifyUrl = "https://www.baidu.com/apiv12881shdla/" . bin2hex(random_bytes(4));
                    $platformOrder = "PT" . bin2hex(random_bytes(8));
                    $amount=rand(100,100000);
                    // 构建插入值
                    $values[] = "(
                        '$amount',
                        '$orderNo',
                        $fromId,
                        '$saleStatus',
                        '$createdAt',
                        NULL,
                        '$notifyUrl',
                        '$platformOrder',
                        0
                    )";
                }
                // 拼接 SQL 语句
                $sql = "INSERT delayed INTO $orderTable 
                        (`amount`,`order_no`, `from_id`, `sale_status`, `created_at`, `delete_at`, `notify_url`, `plat_form_order`, `notice_finish`) 
                        VALUES " . implode(',', $values);
                unset($values);
                Db::connection('my_test')->beginTransaction();
                Db::connection('my_test')->insert($sql);
                Db::connection('my_test')->commit();
                echo "已插入第 $batch 批（共 $totalBatches 批），总计 " . ($batch * $batchesPerInsert) . " 条数据\n";
            }
        }catch (\Throwable $exception){
            writeLog('','default',['info'=>$exception->getMessage()]);
        }
    }
    private function debugFn(string $msg = 'demo') :bool {
        if(is_string($msg)){
            echo sprintf("\033[1;36m%s\033[0m", $msg);
            echo "\n----------------------------------------------------\n";
        }else{
            var_dump($msg);
        }
        return true;
    }
}
````

:::

### 👉[union all](/service/mysql/unionAll)



## 记录

### [mysql内存占用居高不下且不释放](/service/mysql/bug1)
### [innodb索引损坏,修复表](/service/mysql/innodb_damage)
### [记一次 order by 优化](/service/mysql/orderByOptimize)
### [C2C交易订单表按月分表后如何查询](/service/mysql/ftable_query)
### 👉[mysql的三种log](/service/mysql/will_do)
### 👉[史上最全 MySQL 锁详解](https://blog.csdn.net/jam_yin/article/details/149293513)
### delete删除数据
````
# 先看下表的大小
SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS `Size (MB)`
FROM information_schema.TABLES
WHERE table_schema = 'your_database_name' 
  AND table_name = 'your_table_name';

#如果表太大,则分批删除

#delete删除,只是对数据的一种标记,不会真正的删除
#想要真正的删除并且释放空间,请delete结束后,执行

-- 重建表并释放未使用空间
OPTIMIZE TABLE your_table_name;

````

