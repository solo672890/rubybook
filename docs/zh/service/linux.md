---
releaseTime: 2024/8/21
original: true
prev: false
next: false
editLink: true

---
# Linux

## 版本
::: tip 说明
介绍的所有和linux系统有关系的软件,均运行在 Red Hat、CentOS7+ 或 Rocky Linux
:::

## 时间同步
````
# 1. 设置时区
sudo timedatectl set-timezone Asia/Shanghai
# 2. 启用 NTP 同步
sudo timedatectl set-ntp true
# 3. 验证
timedatectl status
# 4. 查看还有哪些时区可以选择
timedatectl list-timezones
````

## 常用命令

### 系统查看
````
cat /etc/os-release

# 机械 or 固态硬盘,输出0 代表是机械硬盘
lsblk -d -o name,rota
````


### 防火墙端口增删查

::: code-group
```sh [增]
firewall-cmd --permanent --add-port=10086/tcp
firewall-cmd --list-ports #查看所有
```
```sh [删]
firewall-cmd --permanent --zone=public --remove-port=8080/tcp
```
```sh [查]
firewall-cmd --permanent --query-port=10086/tcp
```
```sh [重启]
firewall-cmd --reload
```
:::



### 某端口是否被占用,被谁占用
````
netstat -lnp|grep 10086
````
### 某端口是否开放
````
curl 127.0.0.1:3306
````
### 某程序是否在进程中
````
ps -e | grep redis
````
### 查看哪些端口在使用
````
netstat -ntlp
````

### 查看端口被谁占用了
````
fuser -v -n tcp 3306
````
### 自定义命令
````
vim /root/.bashrc
# 手动追加
alias php='/usr/local/bin/php'

source /root/.bashrc
````

### 压缩相关命令
````
tar -xvf xxx.tar
unzip xxx.zip

source /root/.bashrc
````

### lrzsz
`这是一款终端文件上传工具`
````
yum -y install lrzsz
````

### logrotate
`logrotate 程序是一个日志文件管理工具`

[nginx日志轮转](/service/nginx#日志格式配置-logrotate)

### top & free -h
> **top命令会对 Linux 系统中对当前系统资源和进程运行状态的实时监控信息**


::: details 点我查看

会展示大约如下内容
> 
> Tasks: 143 total,   1 running, 142 sleeping,   0 stopped,   0 zombie
>
> | 字段 | 含义 | 
> |:-:|:-:|
> | 143 total | 当前系统中共有 143 个进程（processes） | 
> | 1 running	 | 有 1 个进程正在运行（CPU 正在执行它） | 
> | 142 sleeping	 | 有 142 个进程处于休眠状态（等待某些事件或资源） | 
> | 0 stopped		 | 有 0 个进程被暂停（例如被 Ctrl+Z 暂停或调试器暂停） | 
> | 0 zombie		 | 有 0 个僵尸进程（已终止但未被父进程回收的进程） | 
> 
>



>%Cpu(s):  0.1 us,  0.1 sy,  0.0 ni, 99.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
>|    字段     |              含义               |
>|:---------:|:-----------------------------:|
>|  0.1 us   |     用户空间占用 CPU 百分比（user）      |
>| 0.1 sy		  |    内核空间占用 CPU 百分比（system）     |
>| 0.0 ni		  |   nice 值调整过的进程占用 CPU（优先级调整）   |
>| 99.8 id		 | CPU 空闲百分比（idle）/ <sapn class="marker-text-highlight">超过70说明cpu很空闲</sapn> |
>| 0.0 wa		  | 等待 I/O 完成所占 CPU 百分比（iowait）,<sapn class="marker-text-highlight">如果这个值很高，说明系统在等待磁盘或网络 I/O，可能是性能瓶颈</sapn>  |
>| 0.0 hi		  |        硬件中断所占 CPU 百分比         |
>| 0.0 si		  |        软件中断所占 CPU 百分比         |
>| 0.0 st		  |  被虚拟机偷走的时间（steal，仅在虚拟化环境中可见）  | 

+ `buff/cache`：Linux 会把空闲内存用于缓存磁盘文件，提高访问速度。这不是“占用”，而是“预加载”，可以随时释放
+ `free`：显示的是未被使用的内存，不代表系统“可用”内存。真正的可用内存 = free + buff/cache。

<sapn class="marker-evy">如果想直观的看到内存请,使用 </sapn> `free -h`
````
$ free -h
              total        used      free    shared   buff/cache   available
Mem:           7.1G        1.2G      2.3G        200M        3.6G          5.4G
Swap:          4.0G          0B      4.0G
````

> `buff/cache`：Linux 会把空闲内存用于缓存磁盘文件，提高访问速度。这不是“占用”，而是“预加载”，可以随时释放。
> 
> `free`：显示的是未被使用的内存，不代表系统“可用”内存。真正的可用内存 = free + buff/cache。
> 
> `available` 是系统评估的可用内存，比 free 更准确

:::
### ls -la --block-size=M
把文件大小(bytes)转成M

### nohup

> **使用场景**
> 
>`长时间运行任务`：例如，当你需要运行一个可能需要数小时或数天才能完成的数据分析任务时。
> 
>`守护进程`：对于一些需要持续运行的服务或应用，使用 nohup 可以确保它们不会因为用户的登出而停止。
> 
>`自动化脚本`：对于那些需要定期执行且不需要人工干预的任务，可以使用 nohup 来保证它们的连续性。
> 
::: details 点我查看
````
# 把所有的info和error都到文件，如果不指定文件，他默认输入./nohup.out
nohup /root/start.sh &  # '&'符号将命令放到后台执行

# nohup.out 将标准输出重定向到 nohup.out 文件
# 2>&1  表示将标准错误也重定向到标准输出的地方（在这个例子中即 nohup.out）
nohup ./hello.sh > ./nohup.out 2>&1 &  

# 查找 和 停止nohup
ps -aux | grep ./start.sh  查到该进程，kill -9 进程id
如果不行，就ps -ef |grep php （查找与进程相关的进程，）然后杀死

# 把所有输出信息丢进黑洞
nohup ./hello.sh > /dev/null 2>&1 &
php think command > /dev/null 2>&1

# 自定义输出位置
nohup your_command > output.log 2>&1 &
````

**对于更复杂的后台管理需求，可以考虑使用 screen 或 tmux，它们提供了更加灵活的会话管理功能**

:::





## 安全

### 安装防火墙
````
sudo yum install firewalld

# 启动并设置开机自启
sudo systemctl start firewalld && sudo systemctl enable firewalld

# 查看防火墙状态
sudo firewall-cmd --state
````

### 限制特定ip访问 (添加白名单策略)
::: tip 某些场景非常管用
比如:

A服务器是敏感服务器,那么需要限定只能B服务器访问某端口下的服务

限定某ip ssh登录本服务器(该功能需谨慎,避免ip变化导致无法登录服务器)
:::

````
# 示例：允许IP地址 192.168.1.100 访问 3306 端口
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" port port="3306" protocol="tcp" accept'

# 重载防火墙规则
sudo firewall-cmd --reload
````

### 禁Ping
````
echo "net.ipv4.icmp_echo_ignore_all = 1">>/etc/sysctl.conf
sysctl -p
net.ipv4.icmp_echo_ignore_all = 1   //0代表允许ping
````

### 禁止root登录ssh
::: tip 
使用该功能之前,一定要先添加其他用户,并且测试其他用户能否登录,然后才能禁止root登录;

亚马逊云服务器可以提前创建好用户,该功能就不合适了
:::
````
vim /etc/ssh/sshd_config PermitRootLogin no
systemctl restart sshd 
````

### 修改登录ssh的端口

````
vim /etc/ssh/sshd_config
Port 10086 # 将22修改成10086,避免别人逮着22端口薅
sudo systemctl restart sshd
````

### 使用fail2ban
::: 使用fail2ban,限制 SSH 登录尝试,封锁恶意登录ip

[Fail2ban开源入侵检测，保护SSH，NGINX等](https://blog.csdn.net/m0_74367891/article/details/148537914)

fail2ban 是一款用于防止暴力破解和恶意登录尝试的开源工具，

它通过监控日志文件来检测失败的登录尝试或其他可疑活动，并自动更新防火墙规则以阻止恶意 IP 地址。

它通过监控日志文件来检测失败的登录尝试，当某个 IP 地址在短时间内多次尝试失败后，

Fail2ban 会自动将其添加到防火墙的黑名单中，阻止其进一步访问。

现代的Fail2ban通常可同时过滤IPv4和IPv6攻击，配置没有区别，非常方便。
````
sudo yum install -y fail2ban
sudo vim /etc/fail2ban/jail.local
#添加内容
[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/secure
maxretry = 3       # 允许的最大失败尝试次数
bantime  = 600     # 封禁时间（秒）
findtime = 600     # 在 findtime 秒内统计失败次数

#启动并启用
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

````
通过分析 /var/log/secure 中的 SSH 登录失败记录（如 Failed password），动态封禁 IP

一旦检测到恶意行为，立即更新防火墙规则（如 iptables 或 nftables）。
:::



