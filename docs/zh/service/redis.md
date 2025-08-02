---
releaseTime: 2024/8/21
original: true
prev: false
next: false
editLink: true
---
# redis
<style src="/.vitepress/theme/style/nav.css"></style>


## 文档
<script setup>
const DATA=[
    {
        title: '',
        items: [
            {
                icon: '/icons/redis.png',
                title: '官方文档',
                desc: '以更快的速度、内存和准确性构建 AI 应用程序',
                link: 'https://redis.io/docs/latest/'
            },
            {
                icon: 'https://wiki.echo.cool/resources/assets/logo.png',
                title: '代码酷',
                desc: '免费好用的编程语言框架教程网站，学习编程就上代码酷！',
                link: 'https://www.echo.cool/docs/middleware/redis'
            },
        ]
    },
]
</script>

<MNavLinks v-for="{title, items} in DATA" :title="title" :items="items"/>
<br>

## 安装
<br>
<sapn class="marker-evy">为什么没有选择使用docker安装?</sapn>

某一次使用yum和docker分别安装完redis7.2后,使用redis自带的压测工具测试,发现docker里的redis并发请求掉得很厉害.

使用docker安装很方便,但是使用官网介绍yum安装更快也很方便,并且占用内存小多了

如果你需要批量部署redis,那么一个非常简单的shell脚本即可搞定

::: code-group
````bash [centos7]
# 1.卸载旧版本
yum -y remove redis


### 更新 yum
sudo yum -y update


# 添加yum源
sudo yum -y install http://rpms.remirepo.net/enterprise/remi-release-7.rpm

sudo yum install redis

````
```` shell[centos8 & 9]
vim /etc/yum.repos.d/redis.repo
# 写入.如果你的系统是redhat9或centos9,那么这里则是rockylinux9
[Redis]
name=Redis
baseurl=http://packages.redis.io/rpm/rockylinux8 // [!code highlight]
enabled=1
gpgcheck=1

#运行命令
curl -fsSL https://packages.redis.io/gpg > /tmp/redis.key
sudo rpm --import /tmp/redis.key
sudo yum install redis

````


:::

#启动redis并且设置开机自启动
````
sudo systemctl start redis && sudo systemctl enable redis
````

## 开放远程连接
````
vim /etc/redis.conf
#bind localhost 取消注释 & 改为   bind 0.0.0.0
protected-mode yes 改成 no
systemctl restart redis
````

## 设置redis连接密码
vim /etc/redis.conf
````
requirepass xmshang_ipay_72921_AaBcxiebao
````
systemctl restart redis


## 修改连接端口
vim /etc/redis.conf
````
port 10035
````
systemctl restart redis


## 持久化
rdb 持久化
````
save 900 1
save 300 10
save 60 10000
````
aof持久化
````
# 启用 RDB + AOF 混合模式：
aof-use-rdb-preamble yes
# 如果能接受少量数据丢失
appendonly yes
appendfsync everysec  # 比 always 快 5~10 倍
````

## 压测命令
````
# 总共发送 10,000 次请求, 并发客户端数量为 50
redis-benchmark -h 127.0.0.1 -p 6379 -n 10000 -c 50 -t get
````

## 开启多线程
`版本必须大约6,必须是SSD硬盘,不然提升性能有限`
````
redis-cli config get io-threads
# 输出：1 表示单线程 I/O
#      4 表示 4 个 I/O 线程

vim redis.conf
# 启用多线程 I/O
io-threads 4          # 线程数(建议 = CPU 核心数)
io-threads-do-reads yes # 同时处理读写（Redis 6.0+）


# 在网络密集型场景下，可提升 2~3 倍 QPS
# 多线程只用于网络I/O处理（接收请求和发送响应）,命令执行仍然是单线程的,对读写帮助不大
# 线程并不是越多越好,切换线程也很耗时,低并发反而单线程最快
````

## 单机部署多实例

::: details
`选择高性能的多核 CPU：Redis 是单线程处理请求的，性能取决于单个核心的处理能力`

`Redis 的命令执行核心是单线程（主线程），所有客户端命令的解析、执行、响应都在一个线程中完成`

`因此，单个 CPU 核心的主频越高，Redis 单实例的 QPS（每秒查询数）就越高`

`择高主频（3 GHz 以上）的 CPU 能有效提高 Redis 的单实例性能。`

`优先选择 高主频 CPU（如 Intel Xeon 高频版、AMD EPYC 高频 SKU），而不是只看核心数量`

`多个 Redis 实例可以并行运行在不同的 CPU 核心上，因此多核 CPU 仍然有助于提高整体的吞吐量。`

**当我记录到这里的时候,其实我并不建议单机部署多实例,维护起来很麻烦,要考虑很多东西**

**要计算内存分配,多个实例不要超过物理内存**

**如果都开启 RDB/AOF，可能造成 fork 压力**

**有问题排查效率要降低,集中管理成本要增加**

**如果是物理服务器,那没办法**

**如果是云服务器,那就不要这么干,直接2CPU XG内存,多花一点点钱,少很多事**
:::

## 性能调优
修改 redis.conf
::: details
````
# 根据服务器资源动态调整，避免连接数不足
maxclients 100000  
````
````
# 内存淘汰策略
allkeys-lru：适合缓存场景，淘汰最不常用的键。
volatile-ttl：优先淘汰剩余时间较短的键。
noeviction：严格禁止内存不足时淘汰键（适用于数据必须全部保留的场景）。

maxmemory-policy allkeys-lru  # 所有键使用 LRU 算法淘汰

# 关闭AOF和RDB,视情况选择,大约提升10%
save ""         # 关闭 RDB
appendonly no   # 关闭 AOF

# 使用 MGET/MSET 减少网络往返
MGET key1 key2 key3
MSET key1 value1 key2 value2

使用 Pipeline 发送多个命令
MULTI
SET key1 value1
SET key2 value2
EXEC
````


:::


## [正式服不要轻易重启redis](https://blog.csdn.net/weixin_42350212/article/details/115395276)