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

````ts
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

#启动redis并且设置开机自启动
sudo systemctl enable redis
sudo systemctl start redis
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

## 修改连接端口
vim /etc/redis.conf
````
port 10035
````

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

## [正式服不要轻易重启redis](https://blog.csdn.net/weixin_42350212/article/details/115395276)