---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# mysql内存占用居高不下且不释放

系统内存被占用很高,通过top查看是mysql占用了大量内存,通过排查,是超过了 my.cnf设置的 innodb_buffer_pool_size的设置
,但却一直没有释放,于是检查了mysql链接数并不多且正常,初步推测可能会存在bug.于是查阅资料,果然如我所想

[mysql.bug](https://bugs.mysql.com/bug.php?id=83047)


[MySQL内存为什么不断增高，怎么让它释放](https://mp.weixin.qq.com/s/iUvi0xPtKng08fNu_5VWDg) 这篇文章讲解的很详细

该问题早在5.7已经被提出来了,直到目前8.4官方也一直没有解决

<sapn class="marker-evy">如果你的项目不是高频数据操作,没有5000万以上的数据,</sapn>
<sapn class="marker-evy">仅仅只是外包小项目,完全就可以忽略这个bug</sapn>

## 判断

**innodb_buffer_pool_size设置的值较大时，InnoDB存储引擎能够缓存更多的数据和索引，
从而减少磁盘I/O的次数，提高数据库的访问速度和性能。
相反，如果缓存池设置过小，可能会导致频繁的磁盘I/O操作，影响数据库性能。**

如果内存占用远超过 `innodb_buffer_pool_size`设定的值,且不释放,很有可能是mysql默认内存器 glibc的问题

````
# 如果有输出,说明用的是 jemalloc ,否则就是glibc
pmap -x $(pidof mysqld) | grep jemalloc && pstack $(pidof mysqld) | grep jemalloc
````

[MySQL 8.0 启用 Jemalloc](https://wiki.pha.pub/books/109-TAs/page/mysql-80-jemalloc)

## jemalloc安装
::: details

::: code-group
```` bash [源码编译安装]
wget https://github.com/jemalloc/jemalloc/releases/download/5.2.1/jemalloc-5.2.1.tar.bz2

tar -jxvf jemalloc-5.2.1.tar.bz2 && cd jemalloc-5.2.1

# 生成 configure 脚本（如果未提供）
./autogen.sh

# 配置安装路径（默认安装到 /usr/local）
./configure --prefix=/usr/local

# 编译 && 安装（-j 参数根据 CPU 核心数调整）
make -j$(nproc) && sudo make install

# 验证安装
# 检查头文件
ls /usr/local/include/jemalloc/jemalloc.h

# 检查库文件
ls /usr/local/lib/libjemalloc.so*
# 创建符号链接
sudo ln -s /usr/local/bin/jemalloc-config /usr/bin/jemalloc-config
# 更新库缓存
sudo ldconfig
# 查看版本
jemalloc-config --version

````
:::
## jemalloc使用

首先找到 jemalloc 的动态库路径（如 /usr/lib64/libjemalloc.so.2）
````bash {9-10}
find / -name 'libjemalloc.so*' 2>/dev/null
输出 /usr/lib64/libjemalloc.so.2

sudo systemctl edit mysqld
#添加以下内容
[Service]
Environment="LD_PRELOAD=/usr/lib64/libjemalloc.so.2"

#如果修改 systemctl edit mysqld 报错
# ---- /etc/systemd/system/mysqld.service.d/override.conf: after editing, new contents are empty, not writing file.
# 手动创建 override 文件
sudo mkdir -p /etc/systemd/system/mysqld.service.d
sudo vim /etc/systemd/system/mysqld.service.d/override.conf
# 添加
[Service]
Environment="LD_PRELOAD=/usr/lib64/libjemalloc.so.2"
# 调试用,可以不加
Environment="JEMALLOC_LOG_LEVEL=1" 


 重载并重启服务：
sudo systemctl daemon-reload
sudo systemctl restart mysqld
````

## jemalloc验证
````
lsof -Pn -p $(pidof mysqld) | grep jemalloc

# 输出 mysqld  119170 mysql  mem       REG              259,3    5804192  17124295 /usr/lib64/libjemalloc.so.2
````

## 悲剧结尾
大约事隔7天,在我反复的测试和研究下,mysql8.4内存占用越来越高,并不是因为这个内存分配的原因.

如果不是对mysql特别精通,不要切换到jemalloc.我切换到jemalloc也没能解决该问题.

原因是 我没能正确 `innodb_buffer_pool_size`设置的值,我翻阅了很多资料,还有咨询AI,都建议设置不超过系统内存的70%

事实上,在生产环境上,它不应该超过50%.当时我满脑子都想着如何压榨机器的性能,这是一个错误的想法,

生产环境上最重要的不是追求极致,而应该是稳定
