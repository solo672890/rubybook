---
releaseTime: 2025/2/1
original: true
prev: false
next: false
editLink: true
---
# nginx

## ddos监控
**分析思路**

1.根据运维面板查找出是哪个时间阶段在攻击

2.查出 请求最频繁的前50个ip,确定攻击者ip,可能有多个ip.

::: details 点我查看
````
对应函数名'top50IP'
awk '{count[$1]++} END {for (ip in count) print count[ip], ip}' ./access.log | sort -rn | head -n 30
````

3.查出哪些接口被高频访问,可能攻击者正在攻击这些接口
````
对应函数名'top30Api'
awk '{counts[$6]++} END {PROCINFO["sorted_in"]="@val_num_desc"; for (url in counts) {if (++c <= 30) print counts[url], url}}' './access.log'
````

4.查看不等于200的
````
对应函数名'top10Not200'
awk '($8 != "200") {count[$8]++} END {for (code in count) print count[code], code}' ./access.log | sort -rn | head -n 10
````

5.确定这些攻击者ip访问了哪些接口
````
该ip来自于第一条的结果
对应函数名'trajectoryByIp'
grep '192.168.31.92' './access.log' | tail -n 50 | awk '{print $1,$3,$4,$6,$8,$10,$NF}'
````

6.看这些ip对接口的访问详情
````
对应函数名'trajectoryByIp'
grep '192.168.31.92' './access.log' | grep '/v1/userinfo' | tail -n 50 | awk '{print $1,$3,$4,$6,$8,$10,$NF}'
````

7.增加一个nginx状态监控
````
对应函数名'nginxStatus'

server {
    listen 81;
    server_name 127.0.0.1;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 192.168.31.0/24; # 只允许内网访问
        deny all;
    }
}
curl http://192.168.31.10:81/nginx_status  #测试

返回内容
Active connections: 1 
server accepts handled requests
         18       18      23 
Reading: 0 Writing: 1 Waiting: 0

Active connections：当前 Nginx 正处理的活动连接数（1186），也就是当前的并发连接数
如果 Waiting 明显减少但 Active connections 增加，可能是 连接耗尽攻击（如 DoS 攻击
如果 accepts 远大于 handled，说明部分连接未被处理（可能是连接被攻击者占用但未完成请求）
如果 requests 急剧增长但 accepts 和 handled 不匹配，可能是 恶意请求（如 Slowloris 攻击）
````
:::







## 配置:vue,反向代理
::: details 点我查看

::: code-group
```` sh{8-9,25-27} [webman反向代理+vue]
upstream one_api {
    server 127.0.0.1:8787;
    keepalive 10240;
}
server {
    server_name www.baidu.com;
    listen 80;
    # 配置解释:日志不会每来一个请求就立即写入磁盘，而是先写入内存中的缓冲区.当缓冲区满时(达到 16k),才会一次性写入磁盘,即使缓冲区未满,每 30 秒也会强制将缓冲区内容写入磁盘一次
    access_log /www/sites/www.baidu.com/log/access.log main buffer=16k flush=30s; 
    error_log /www/sites/www.baidu.com/log/error.log; 

    location /v1 {
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        if (!-f $request_filename){
            proxy_pass http://one_api;
        }
    }
    
    # 代理vue页面
    location / {
    	try_files $uri $uri/ /index.html; #本地代理
    }
    # vue代理前端自己加的api到远程
    #location /api/ {
    #    proxy_pass http://18.166.62.179:15215/; 
    #}
    
    # 拒绝访问所有以 .php 结尾的文件
    location ~ \.php$ {
        return 404;
    }
    
    # 允许访问 .well-known 目录
    location ~ ^/\.well-known/ {
        allow all;
    }
    
    # 不记录日志
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    # 拒绝访问所有以 . 开头的文件或目录
    location ~ /\. {
        return 404;
    }
    
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|bmp|swf|eot|svg|ttf|woff|woff2)$ {
        expires        30d;
        access_log off;
        log_not_found  off;
    }
    #认我们在请求txt/doc/pdf/ppt等类型的文件时会在浏览器进行渲染，为了安全，强烈建议当请求此类文件时进行下载而不是预览
    location ~ .*\.(txt|doc|pdf|rar|gz|zip|docx|exe|xlsx|ppt|pptx)$ {
        add_header Content-Disposition attachment;
    } 
    
    root /home/www/one_api/public;
    error_page 404 /404.html; 
}
````
:::
## 日志格式配置-logrotate
::: details 点我查看

`vim /etc/logrotate.d/nginx`
````
/var/log/nginx/*.log {
    daily
    size 10M
    rotate 30
    missingok
    notifempty
    compress
    delaycompress
    create 0640 www-data adm
    sharedscripts
    dateext
    dateformat %Y%m%d_
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
````
````
# 测试配置是否生效（dry run）
sudo logrotate -d /etc/logrotate.d/nginx
````
````
# 强制执行一次轮转（可选）
sudo logrotate -f /etc/logrotate.d/nginx
````
:::

## 日志格式配置-shell
::: details 点我查看

```ts{12-13}
user root; 
worker_processes auto; 
error_log /var/log/nginx/error.log error; 
error_log /dev/stdout error; 
pid /var/run/nginx.pid; 
events {
    worker_connections 2048; 
}
http {
    include mime.types; 
    default_type application/octet-stream; 
    log_format main '$remote_addr - [$time_local] "$request" ' '$status $request_length  ' '"$http_user_agent" "$http_x_forwarded_for"' ' rt=$request_time uct=$upstream_response_time'; 
   
    server_tokens off; 
    access_log /var/log/nginx/access main buffer=64k flush=5s; # 也可以在这里配置syslog+远程日志服务
    access_log /dev/stdout main; 
    sendfile on; 
    server_names_hash_bucket_size 512; 
    client_header_buffer_size 32k; 
    client_max_body_size 50m; 
    keepalive_timeout 10; 
    keepalive_requests 100000; 
    gzip on; 
    gzip_min_length 1k; 
    gzip_buffers 4 16k; 
    gzip_http_version 1.1; 
    gzip_comp_level 2; 
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/css application/xml; 
    gzip_vary on; 
    gzip_proxied expired no-cache no-store private auth; 
    gzip_disable "MSIE [1-6]\."; 
    include /usr/local/openresty/nginx/conf/conf.d/*.conf; 
    include /usr/local/openresty/1pwaf/data/conf/waf.conf; 
}
```
:::

## 日志切割和清理
`提示:有宝塔或者1panel,最好还是用他们的方案,毕竟有可视化工具和定时切割日志方案`
::: details 点我查看

```
创建日志切割以及清理脚本
sudo vi ./cut_nginx_log.sh

附予执行权限
sudo chmod +x ./cut_nginx_log.sh

添加定时任务
crontab -e

#每天0时1分进行日志分割 参数一: 日志路径 参数二: 日志保留天数
01 00 * * * /绝对路径/cut_nginx_log.sh  ./   37
 
```

```
#!/bin/bash
LOGS_PATH=$1
DAYS=$2
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
#按天切割日志
mv ${LOGS_PATH}/access.log ${LOGS_PATH}/access_${YESTERDAY}.log
#向 Nginx 主进程发送 USR1 信号，重新打开日志文件，否则会继续往mv后的文件写内容，导致切割失败.
kill -USR1 `ps axu | grep "nginx: master process" | grep -v grep | awk '{print $2}'`
#删除配置的N天前的日志
cd ${LOGS_PATH}
find . -mtime +${DAYS} -name "*20[1-9][3-9]*" | xargs rm -f
exit 0
```
:::






## 运维分析
👉 [分析来自于nginx日志,所以要先配置日志](#日志格式配置)

::: details 点我查看
### 查看指定IP访问指定接口的访问轨迹，按时间倒叙排序
````
grep '192.168.31.92' ./access.log | grep '/v1/userinfo' | tail -n 30 | awk '{print $1,$3,$4, $6, $8,$10,$NF}'

````
###  查看指定IP的访问轨迹，按时间倒叙排序.
````
grep '192.168.31.92' ./access.log | tail -n 30 | awk '{print $1,$3,$4, $6, $8,$10,$NF}'
````

### 统计IP总访问量(PV)
````
awk '{print $1}' ./access.log | wc -l
````

### 独立IP访问统计(UV)
````
awk '{print $1}' ./access.log | sort -n | uniq |wc -l
````

### 查看某一时间段的IP访问量(5-7点)
````
grep '31/Mar/2025:0[5-7]' ./access.log | awk '{print $1}' | sort -n | uniq | sort -nr |wc -l
查看 19-21点 有哪些ip访问
grep '\[09/Apr/2025:1[9-9]:\|[20-21]:' access.log | awk '{print $1}' | sort | uniq -c | sort -rn

result:6  代表6个ip进行了访问
````

### 查看访问最频繁的前100个IP
````
awk '{print $1,$3,$4,$6}' ./access.log  | sort -n | uniq -c | sort -nr | head -n  10
输出 2220(出现的次数) 192.168.31.92 [09/Apr/2025:20:47:28 +0800] /v1/loginSms
````
### 查看访问次数在100次以上的IP ($1>100)
````
awk '{print $1}' ./access.log  | sort -n | uniq -c |  awk '{if($1 >2) print $0}' |  sort -nr  | head -n  10
````

### 查看访问最频繁的页面(top 50)
````
awk '{print $6}' ./access.log  | sort | uniq -c | sort -rn | head -n 50
````


### 查看页面访问次数超过100次的页面
````
cat ./access.log | cut -d ' ' -f 6 | sort | uniq -c |  awk  '{if($1 >100) print $0}'
````

### 统计每秒的请求数，top100的时间点(精确到秒)
````
awk '{print $3}' ./access.log | cut -c 14-21| sort | uniq -c | sort -rn| head -n 100
````
### 统计每分钟的请求数，top100的时间点(精确到分钟)
````
awk '{print $3}' ./access.log | cut -c 14-18| sort | uniq -c | sort -rn| head -n 100
````
### 统计每小时的请求数，top10的时间点(精确到小时)
````
awk '{print $3}' ./access.log | cut -c 14-15| sort | uniq -c | sort -rn| head -n 10
````

### 慢接口,列出页面请求时间超过0.7秒的页面，并统计其出现的次数，显示前30条
````
#前置条件：在nginx的log中最后一个字段加入$request_time
cat ./access.log | awk '($NF > 0.7 ) {print $6}' | sort -n | uniq -c | sort -nr | head -30
````

:::

## 限流配置|防cc
::: details 点我查看
````
# 定义了一个 mylimit 缓冲区（30m）.每M可跟踪1.6万个ip，请求频率为每秒 15 个请求（r/s）,
# ip跟踪缓存池为30M,超过缓存池后会503
limit_req_zone $binary_remote_addr zone=mylimit:60m rate=15r/s ;
# limit_conn_zone $binary_remote_addr zone=conn_limit_zone:60m; 如果被ddos攻击,开启这个,替换上面的配置
server {
    # 若客户端在 5 秒内未发送完整请求体或头，Nginx 会主动断开连接，节省资源,快速关闭恶意连接
    # client_body_timeout 5s;  如被攻击,开启这个,cc攻击发送大量的资源
    # client_header_timeout 5s; 如被攻击,开启这个,

    location / {
        limit_req_status 429; #默认返回503，修改返回值为429
        limit_req zone=mylimit burst=50 delay=15; 
        #limit_conn conn_limit_zone 3; 如被ddos攻击,开启这个,限制每个ip 同时3个请求,替换上面的配置
        proxy_pass http://localhost:7070;
    }
}

### inactive=30s 表示 IP 在 60 秒内无请求时，记录会被清理
📌 通俗理解： 假设瞬间来了非常多的请求.
* 1-15个请求,直接通过。(rate=15r/s)
* 16-30个请求,延迟排队处理。(delay=15)
* 超过 30 个 → 超过部分全部拒绝。(rate+delay)
* 超过 50个的部分,nginx不再响应它 (burst=50)

burst代表队列的总长度,delay代表这个队列里,可延迟处理的数量.

📜 Nginx 官方文档佐证
"The delay parameter specifies how many requests are delayed to comply with the configured rate. Excess requests beyond the delay are rejected immediately, even if they are within the burst limit. "
翻译:
"delay 参数指定有多少请求会被延迟以符合限速规则。超出 delay 数量的超额请求会立即被拒绝，即使它们仍在 burst 限制范围内。"
````
:::

## 使用abs测试
````  [ab压测]
# -n 12000 请求总数
# -c 12000 表示并发数
# -p test.txt 携带请求体(内容里是json格式)
# -T 表示请求体格式

.\Apache24\bin\abs.exe  -n 12000 -c 12000 -p test.txt -T application/x-www-form-urlencoded -k  http://www.oneApi.com/v1/loginSms
````





### 👉 [压缩级别设置](/service/nginx/compress_level)
### 👉 [nginx+lua实现动态ip黑名单](https://juejin.cn/post/7306038680963579919)

