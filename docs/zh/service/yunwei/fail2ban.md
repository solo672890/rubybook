---
releaseTime: 2026/11/18
original: true
prev: false
next: false
editLink: true

---

# 使用fail2ban

::: tip 说明
使用fail2ban,限制 SSH 登录尝试,封锁恶意登录http ip
fail2ban 是一款用于防止暴力破解和恶意登录尝试的开源工具，

它通过监控日志文件来检测失败的登录尝试或其他可疑活动，并自动更新防火墙规则以阻止恶意 IP 地址。

它通过监控日志文件来检测失败的登录尝试，当某个 IP 地址在短时间内多次尝试失败后，

Fail2ban 会自动将其添加到防火墙的黑名单中，阻止其进一步访问。

现代的Fail2ban通常可同时过滤IPv4和IPv6攻击，配置没有区别，非常方便。
:::

[Fail2ban开源入侵检测，保护SSH，NGINX等](https://blog.csdn.net/m0_74367891/article/details/148537914)

## 安装

````
# Debian/Ubuntu
sudo apt install fail2ban python3-pyinotify -y

# CentOS/RHEL
sudo yum install fail2ban python3-inotify -y

# 验证 pyinotify(高性能日志监控后端) 可用
/usr/bin/python3 -c "import pyinotify; print('OK')"
````

## 自定义过滤器,过滤nginx 403 404

````
vim /etc/fail2ban/filter.d/nginx-403-404.conf

[Definition]
# 匹配 Nginx 默认 combined 日志格式中的 403 和 404 状态码
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" (403|404) .*$
ignoreregex =
````

⚠️ 重要提示：failregex 必须与您实际的 Nginx 日志格式完全匹配。如果您的 Nginx 使用了非标准日志格式，请先用 fail2ban-regex
测试：

`sudo fail2ban-regex /var/log/nginx/access.log /etc/fail2ban/filter.d/nginx-403-404.conf`

## 配置 Jail

````shell
vim /etc/fail2ban/jail.d/nginx-403-404.conf


[nginx-403-404]
enabled   = true

# 永久忽略，不参与封禁
ignoreip  = 127.0.0.1/8 ::1 95.40.181.203


port      = http,https
filter    = nginx-403-404
logpath   = /www/wwwlogs/api.com.log
 /www/wwwlogs/api1.com.log
backend   = pyinotify

# === 封禁策略 ===
# 允许的最大失败次数
maxretry  = 8
# 统计时间窗口（秒），60秒内触发10次即封禁
findtime  = 60
# 封禁时长（秒），1小时
bantime   = 86400
# 或使用 nftables[type=multiport]
banaction = iptables-multiport

# === 渐进式封禁===
# 启用后，重复违规者封禁时间会指数级增长
bantime.increment = true
# 每次翻倍：1h → 2h → 4h → 8h...
bantime.factor    = 2
# 最大封禁7天
bantime.maxtime   = 604800

````

## 自定义过滤器,过滤恶意请求头

常见脚本客户端标识，但建议按实际异常行为决定是否封禁

| User-Agent 关键字 | 常见来源 | 建议|
|:---------------------:|:-----------------------------:|:-----------------------------:|
| python-requests、`python-httpx`、`aiohttp` | Python 脚本 | 确认没有正常集成使用后再封
| wget | 命令行下载工具 | 确认没有监控或定时任务使用后再封
| Go-http-client | Go 程序 | 可能包含正常服务端调用
| node-fetch、`axios`、`undici`      | Node.js HTTP 客户端 | 你的 Vue/Node 生态可能用到，谨慎处理
| Java、`okhttp`、`Apache-HttpClient`      | Java、Android 客户端 | 避免直接全封，可能影响 App
| 空 User-Agent | 脚本或未设置标识的客户端 | 先观察正常业务是否出现

````nginx
# 我不建议使用nginx封禁,当它发现请求头的原因会被直接拦截,
# 则会立马换正常请求头.不如使用fail2ban直接露头封ip有效
if ($http_user_agent ~* "python-urllib|curl|python-requests|python-httpx|aiohttp|wget|okhttp|Apache-HttpClient") {
    return 403;
}
````
`vim /etc/fail2ban/filter.d/nginx-script-ua.conf`

**可能会误杀合作方,所以要提前沟通好,使用application/json作为请求头**
````shell
[Definition]
failregex = ^<HOST> \S+ \S+ \[[^]]*\] "[^"]*" [0-9]{3} [0-9]+ "[^"]*" "(?i:[^"]*(?:python-urllib|curl|python-requests|python-httpx|aiohttp|wget|okhttp|Apache-HttpClient)[^"]*)"\s*$
ignoreregex =
````

`vim /etc/fail2ban/jail.d/nginx-script-ua.local`
````shell
[nginx-script-ua]
enabled  = true
filter   = nginx-script-ua

# 填写 B 上实际产生上述 HTTP 日志的文件路径
logpath  = /www/wwwlogs/lw98965823568.com.log


port     = http,https

ignoreip = 127.0.0.1/8 ::1

backend   = pyinotify

# === 封禁策略 ===
# 允许的最大失败次数
maxretry  = 8
# 统计时间窗口（秒），60秒内触发10次即封禁
findtime  = 60
# 封禁时长（秒），1day
bantime   = 86400
# 或使用 nftables[type=multiport]
banaction = iptables-multiport

# === 渐进式封禁===
# 启用后，重复违规者封禁时间会指数级增长
bantime.increment = true
# 每次翻倍：1bantime → 2bantime → 4bantime → bantime...
bantime.factor    = 2
# 最大封禁7天
bantime.maxtime   = 604800

````


## 启动与验证

````shell
#开机启动
sudo systemctl enable --now fail2ban

# 检查语法,重载配置（使 pyinotify 生效）
sudo fail2ban-client -t && sudo systemctl restart fail2ban

# 心跳检查
sudo fail2ban-client ping

# 确认 jail 状态及 backend
sudo fail2ban-client status nginx-403-404
sudo fail2ban-client status nginx-script-ua

# 确认 pyinotify 已加载（查看最新日志）
grep -i "Initiated 'pyinotify'" /var/log/fail2ban.log | tail -1
````

##  日常运维命令速查

````shell
#查看多个过滤器封禁时间和预计解封时间
for jail in nginx-403-404 nginx-script-ua; do
  echo "[$jail]"
  sudo fail2ban-client get "$jail" banip --with-time
done

#查看单个过滤器封禁时间和预计解封时间
fail2ban-client get nginx-script-ua banip --with-time

# 查看封禁列表	    
sudo fail2ban-client get nginx-403-404 banned 

#手动封禁IP	    
sudo fail2ban-client set nginx-403-404 banip 1.2.3.4

#手动解封IP	    
sudo fail2ban-client set nginx-403-404 unbanip 1.2.3.4

#实时查看封禁日志	
sudo tail -f /var/log/fail2ban.log | grep Ban

# 查看某个ip是否被封禁,1 表示该 jail 已封禁这个 IP，`0` 表示未封禁
for jail in nginx-403-404 nginx-script-ua; do
  echo "[$jail]"
  sudo fail2ban-client get "$jail" banned 91.74.20.38
done
````




