---
releaseTime: 2025/2/1
original: true
prev: false
next: false
editLink: true
---
# nginx

## ddos监控
### 分析思路
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




