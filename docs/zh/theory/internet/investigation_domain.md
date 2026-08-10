---
releaseTime: 2026/8/3
original: true
prev: false
next: false
editLink: false
comment: true

---

# 如何排查域名无法访问的具体原因?

**正常中的域名突然无法访问，一般有多种原因造成**

比如nginx解析错误，域名过期，服务器错误等问题，但是在这里只记录网络层问题。

有如下网络问题导致无法访问域名：

1. DNS 污染
2. IP/TCP 阻断
3. SNI/TLS 阻断
4. HTTP 劫持
5. 链路/IP 层过滤
6. 等等

先给出一个排查树：
````[shell]
                域名国内打不开，海外能打开
                          |
                          v
                       dig 域名 
           (dig是DNS（域名系统）查询和排错工具)
                          |
             +------------+-------------+
             |                          |
        IP 不正确                     IP 正确
             |                          |
             v                          v
       DNS污染/劫持               curl --resolve
                                        |
                         +--------------+--------------+
                         |                             |
                      连接不上                       能连接
                         |                             |
                         v                             v
                    tcpdump 双端                 TLS 是否成功
                         |                             |
              +----------+----------+          +------+------+
              |                     |          |             |
          SYN没到服务器       SYN到,SYNACK回不来   TLS失败       TLS成功
              |                     |          |             |
          路由/运营商问题        IP/链路过滤     SNI/TLS过滤     HTTP检查
                                                               |
                                                       +-------+-------+
                                                       |               |
                                                   内容正常         内容异常
                                                                       |
                                                                  HTTP劫持/
                                                                  服务配置

````



## 1.确认真实ip

````[shell]ts{2,5,6,7}
//查找域名的真实ip地址
dig +short 你的域名   

//在公共 DNS 服务器上查询域名的所在的ip
dig @223.5.5.5 你的域名         //阿里 DNS (AliDNS)                 
dig @119.29.29.29 你的域名      //腾讯 DNS (DNSPod)                 
dig @8.8.8.8 你的域名           //谷歌 DNS (Google Public DNS)      


````

为什么要连着查这三个？

当你用这三个 IP 依次查询同一个域名时，你其实是在做“DNS 解析一致性测试”。

如果这三个服务器返回的 IP 地址都一样，说明你的域名解析配置非常健康，全球各地的用户大概率都能正常访问。

如果它们返回的 IP 不一样，或者有的能查到有的查不到，这就说明你的 DNS 配置可能有问题，或者你的域名解析还没有在全球范围内同步生效（DNS 传播需要时间）

**最重要的是查权威 DNS**

````[shell]ts{2,7}
//获取域名的权威DNS服务器,用户输入域名（假设本地没有dns缓存） → 域名根服务器（他不存具体 IP，会转交给权威名称服务器）-> 权威dns服务器查地址,返回ip）
dig NS 你的域名  

//我在name.com购买的域名，结果返回了 ns4cfn.name.com ns3cna.name.com .....

//在大陆机房和海外机房 分别 查询域名的真实ip
dig @ns4cfn.name.com ipaywebsite.com A


//如果返回的ip地址和你在name.com上设置的ip地址不一致，说明域名被污染了，或者被劫持了。
//如果一致，那基本就不要再往“DNS污染”方向查了。
````

## 2. 完全绕过 DNS 测试(用国内服务器测试)

````[Bash]
//-v 表示显示详细的请求和响应过程，-k 表示跳过 SSL 证书验证
//不要查询 DNS，表示这个域名就是对应的这个ip
curl -vk --connect-timeout 8 \
  --resolve 你的域名:443:你的ip \
  https://你的域名/
````
`如果 curl -vk https://你的域名/ 失败`

`但是 curl -vk --resolve 你的域名:443:你的ip https://你的域名/ 成功`

那么 DNS 层问题的概率非常高,因为你指定ip访问是正确的，不指定ip是错误的，说明域名解析是有问题的，可能是 DNS 污染或者劫持。

## 3.看 TCP 能不能建立连接

````[Bash]
//大陆服务器上监听抓包数据
sudo tcpdump -ni any port 443

//其他服务器请求，重点不是证书报错，而是看：
curl -vk --connect-timeout 5 https://大陆服务器ip/    


````
如果成功，能看到请求数据
````
//这里可以看到有seq(序列号),ack(确认号),win(窗口大小),length(数据长度)等信息
//说明 TCP 三次握手已经完成，连接建立成功
00:33:01.412422 eth0  Out IP 172.17.153.76.https > 95.40.63.64.40394: Flags [F.], seq 5756, ack 873, win 458, options [nop,nop,TS val 1005557551 ecr 3411151299], length 0
00:33:01.412517 eth0  In  IP 95.40.63.64.40394 > 172.17.153.76.https: Flags [F.], seq 873, ack 5756, win 449, options [nop,nop,TS val 3411151300 ecr 1005557468], length 0
00:33:01.412520 eth0  Out IP 172.17.153.76.https > 95.40.63.64.40394: Flags [.], ack 874, win 458, options [nop,nop,TS val 1005557551 ecr 3411151300], length 0
00:33:01.493990 eth0  In  IP 95.40.63.64.40394 > 172.17.153.76.https: Flags [.], ack 5757, win 449, options [nop,nop,TS val 3411151381 ecr 1005557551], length 0
````
如果一直
Trying... 

Trying...

Connection timed out

很可能 TCP 三次握手就没完成，说明包在到大陆服务器之前就丢了。

导致的原因有：

* 中国出口线路
* 国际路由
* 运营商
* IP/网段过滤
* 大陆服务器的防火墙

**<sapn class="marker-evy">如果服务器能看到：</sapn>**
````
10:39:48.388269 IP 172.17.153.76.52438 > 95.40.20.157.http: Flags [S], seq 402221607, win 59220, options [mss 8460,sac6 ecr 0,nop,wscale 7], length 0
10:39:50.436271 IP 172.17.153.76.52438 > 95.40.20.157.http: Flags [S], seq 402221607, win 59220, options [mss 8460,sac4 ecr 0,nop,wscale 7], length 0
10:39:54.468269 IP 172.17.153.76.52438 > 95.40.20.157.http: Flags [S], seq 402221607, win 59220, options [mss 8460,sac6 ecr 0,nop,wscale 7], length 0
......


这里只有seq，没有ack，说明 SYN 包发出去了，但是没有收到服务器的 SYN+ACK 包，说明 TCP 三次握手没完成，连接建立失败。
````

**这不是 DNS 污染。可能是 IP / 网络路径 / 跨境链路过滤。**

**大陆 SYN 到了服务器，服务器 SYN-ACK 发出来了，但是 SYN-ACK 回不来，说明服务器的 SYN-ACK 包被丢弃了，可能是运营商/防火墙/路由器过滤了。**

## 4.如果某地能访问，某地无法访问

**比如** 广东移动打不开，但广东电信、北京联通正常

`这不是全国性的 DNS 污染，也不像整个域名被统一封锁；更像广东移动这一条运营商网络上的 DNS/路由/TCP 过滤问题`

````
//找一台广东移动线路的服务器,看有没有返回正确的ip
dig 你的域名.com
````

````
//然后分别执行：
dig 你的域名.com
dig @223.5.5.5 你的域名.com
dig @119.29.29.29 你的域名.com

如果返回的ip一致，可以确定不是dns污染问题，而是广东移动线路的路由/链路过滤问题。
````

````
//接下来直接绕过 DNS：
curl -vk --connect-timeout 8 \
--resolve 你的域名.com:443:你的IP \
https://你的域名.com/

如果任然是
Trying 你的IP:443...
...
Connection timed out

````
**那基本说明：** 换 DNS 没用，因为 DNS 已经被彻底绕过了，广东移动到你的ip:443 的 TCP 链路本身存在问题。

### 排查是ip问题，还是域名问题

### 排查域名
再准备一个新域名解析到你的服务器上，然后在广东服务器上分别执行
````[Bash]

openssl s_client \
-connect 你的IP:443 \
-servername 旧域名.com

openssl s_client \
-connect 你的IP:443 \
-servername 新域名.com


````
如果结果是：

`旧域名.com     reset`

`新域名.com     正常`

**域名/SNI 维度问题。那么说明广东移动针对旧域名/SNI 做了过滤，导致无法访问。** 

**如果两个域名都超时，说明是IP问题**

### 排查IP
AWS，临时换一个新的 Elastic IP，绑定到同一台机器。

旧 IP：
1.1.1.1

新 IP：
2.2.2.2

然后先不要修改 DNS，直接在广东移动测试：
````[Bash]
curl -vk \
--resolve 你的域名.com:443:2.2.2.2 \
https://你的域名.com/

如果：
旧 IP 1.1.1.1
→ 广东移动失败

新 2.2.2.2 IP
→ 广东移动立即成功

而使用的始终都是同一个域名，
那么你几乎可以直接排除：

* DNS 污染
* 域名 SNI 被封，因为域名完全没有变。
````
唯一明显变化就是：IP。因此结论

**广东移动针对旧 IP / IP 段 / 到该 IP 的网络路径存在异常。**




