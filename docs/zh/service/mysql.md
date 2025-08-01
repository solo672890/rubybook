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
<br>
如果要集群部署或者测试,还是docker比较方便,建议用docker

### 1 创建mysql用户组
````
groupadd mysql    #创建mysql
useradd -r -g mysql mysql    #增加mysql用户并让它属于mysql用户组
````

### 2.安装必备包
````
yum -y install libaio
yum install openssl-devel
````


### 3. 查询是否安装 mariadb 避免冲突
````
rpm -qa | grep mariadb                  yum -y remove mariadb*
rpm -qa | grep -i mysql   # -i 忽略大小写                 
yum -y remove mysql* # 删除旧版,如果有
find / -name mysql    #找到相关的自行删除
rm -rf /etc/my.cnf.d
````

### 4.开始安装 mysql8.4
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

## 压测
使用 Sysbench 压测
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
#配置
30G_SSD  8G内存 2CPU aws云服务器

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
# --oltp_read_write 读写混合模式   
    # --oltp_point_select    只做主键查询           测试QPS,缓存性能
    # --oltp_write_only      写操作集合（无读）      写性能、I/O 压力测试
    # --oltp_insert          仅插入                插入吞吐、日志写入测试
    # --oltp_read_write      读写混合（默认）       综合 OLTP 性能评估

# --threads=200              模拟200个并发线程连接,启动 200 个工作线程 
# --report-interval          每 x 秒报告一次中间结果
# 持续测试60s



sysbench \
  --db-driver=mysql \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=test351c042ae7_A \
  --mysql-db=sbtest \
  --tables=10 \
  --table_size=1000000 \
  --threads=100 \
  --time=120 \
  --report-interval=10 \
  oltp_read_write run
````

```` sh [结果]
#  tps(每秒处理事务的数量): 498.70
[ 10s ] thds: 100 tps: 498.70 qps: 10148.94 (r/w/o: 7113.75/2027.99/1007.20) lat (ms,95%): 297.92 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 100 tps: 535.92 qps: 10686.55 (r/w/o: 7494.85/2119.77/1071.94) lat (ms,95%): 272.27 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 100 tps: 535.61 qps: 10709.72 (r/w/o: 7496.98/2141.52/1071.21) lat (ms,95%): 287.38 err/s: 0.00 reconn/s: 0.00
[ 40s ] thds: 100 tps: 529.50 qps: 10591.36 (r/w/o: 7413.07/2119.29/1059.00) lat (ms,95%): 257.95 err/s: 0.00 reconn/s: 0.00
[ 50s ] thds: 100 tps: 532.60 qps: 10633.09 (r/w/o: 7438.79/2129.30/1065.00) lat (ms,95%): 272.27 err/s: 0.00 reconn/s: 0.00
[ 60s ] thds: 100 tps: 547.10 qps: 10979.57 (r/w/o: 7685.78/2199.29/1094.50) lat (ms,95%): 272.27 err/s: 0.00 reconn/s: 0.00
SQL statistics:
    queries performed:
        read:                            446530
        write:                           127580
        other:                           63790
        total:                           637900
    transactions:                        31895  (530.24 per sec.)
    queries:                             637900 (10604.74 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

General statistics:
    total time:                          60.1508s
    total number of events:              31895

Latency (ms):
         min:                                    7.53
         avg:                                  188.38
         max:                                  618.84
         95th percentile:                      277.21
         sum:                              6008309.86

Threads fairness:
    events (avg/stddev):           318.9500/5.35
    execution time (avg/stddev):   60.0831/0.04



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