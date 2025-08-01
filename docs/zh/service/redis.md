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
appendfsync everysec
````

## 压测命令
````
# 总共发送 10,000 次请求, 并发客户端数量为 50
redis-benchmark -h 127.0.0.1 -p 6379 -n 10000 -c 50 -t get
````

## 是否开启多线程,版本必须大约6
````
redis-cli config get io-threads
# 输出：1 表示单线程 I/O
#      4 表示 4 个 I/O 线程


#核心命令执行是单线程，只能用一个核心,Redis 6.0+ 可通过多线程 I/O 利用多核,
#在网络密集型场景下，可提升 2~3 倍 QPS
````

## [正式服不要轻易重启redis](https://blog.csdn.net/weixin_42350212/article/details/115395276)