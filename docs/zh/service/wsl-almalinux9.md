---
releaseTime: 2026/10/06
original: true
prev: false
next: false
editLink: true
---

::: tip 说明
之前我一直使用VMware运行程序,但是明显wsl更香,更灵活,所以我选择wsl.但是存在一些坑,这里记录下来.
:::

# Windows 11 安装 WSL 2 与 AlmaLinux 9 详细指南


适用环境：Windows 11；AlmaLinux 9；Linux 系统存放在 D 盘；PHP 在 WSL 中运行，Node.js 在 Windows 中运行。

> 命令必须在标明的终端执行：`powershell` 代码块在 Windows PowerShell 执行；`bash` 代码块在 AlmaLinux 终端执行。本文是操作指南，未在你的电脑上代为执行。
> 已有 AlmaLinux 的电脑先运行 `wsl -l -v`，确认现状，不必重复安装。不要使用 `wsl --unregister` 来排查一般问题，它会删除该发行版的数据。

## 1. 检查硬件虚拟化

按 `Ctrl + Shift + Esc` 打开任务管理器，进入“性能 → CPU”，确认“虚拟化：已启用”。如果禁用，在 BIOS/UEFI 中启用 Intel Virtualization Technology 或 AMD SVM；菜单位置以电脑厂商说明为准。

安装前确认 D 盘有足够空间。系统、软件包、数据库和日志都会使虚拟磁盘增长。

## 2. 安装 WSL

右键 Windows 开始菜单，选择“终端（管理员）”，在 PowerShell 中执行：

```powershell
wsl --install --no-distribution
```

此命令安装 WSL，不安装默认 Ubuntu。完成后重启 Windows。不是关机再启动,是重启.

## 3. 更新 WSL，设置 WSL 2

重启后在 PowerShell 执行：

```powershell
wsl --update
wsl --version
wsl --status
wsl --set-default-version 2
```

如果 Microsoft Store 更新通道失败，可尝试：

```powershell
wsl --update --web-download
```

`wsl --version` 查看 WSL 软件版本；`wsl --set-default-version 2` 指定新发行版采用 WSL 2 架构。两种“版本”含义不同。AlmaLinux 官方推荐的现代 `.wsl` 安装格式需要 WSL 2.4.4 或更高版本。

## 4. 将 AlmaLinux 9 安装到 D 盘

在 PowerShell 查询发行版：

```powershell
wsl --list --online
```

确认列表中有 `AlmaLinux-9`，然后执行：

```powershell
wsl --install -d AlmaLinux-9 --location "D:\WSL\AlmaLinux9"
```

选择未被其他发行版占用的目标目录。若不识别 `--location`，更新 WSL，重新打开终端后重试。

安装完成后查询：

```powershell
wsl -l -v
```

确认 `AlmaLinux-9` 的 `VERSION` 为 `2`。可设置它为默认发行版：

```powershell
wsl --set-default AlmaLinux-9
```

### D 盘存储与挂载路径的区别

| 路径 | 含义 |
| --- | --- |
| `D:\WSL\AlmaLinux9` | Windows 上存储 Linux 发行版虚拟磁盘的目录 |
| `/mnt/d` | Linux 访问 Windows D 盘的路径 |
| `/mnt/c` | Linux 访问 Windows C 盘的路径 |
| `/home`、`/www` | Linux 内部目录，数据存储在发行版的虚拟磁盘中 |

终端显示 `/mnt/c/Users/solo1` 只表示当前工作目录，不能据此判断 Linux 虚拟磁盘存放在 C 盘。修改 `/etc/wsl.conf` 的 `[automount] root` 也不会迁移虚拟磁盘。

不要通过资源管理器手动搬动或修改 `ext4.vhdx`。

## 5. 首次启动并设置用户

在 PowerShell 启动：

```powershell
wsl -d AlmaLinux-9
```

如果提示创建用户，填写例如 `solo`，设置 Linux 密码。输入密码时没有字符或星号回显，是正常情况。Linux 密码与 Windows 密码独立。

在 Linux 中确认：

```bash
whoami
cat /etc/os-release
```

### 如果首次启动直接进入 root

仅在 `whoami` 显示 `root`，且 `solo` 用户尚不存在时执行：

```bash
useradd -m -G wheel solo
passwd muyu672890
```

配置默认用户：用现有编辑器修改 `/etc/wsl.conf`，保留其他配置，添加或修改：

```ini
[user]
default=solo
```

如果没有编辑器，可在 root 会话中先安装：

```bash
dnf install -y nano
nano /etc/wsl.conf
```

Nano 保存：`Ctrl + O`，回车，再 `Ctrl + X` 退出。随后在 PowerShell 执行：

```powershell
wsl --shutdown
wsl -d AlmaLinux-9
```

重新运行 `whoami` 确认默认用户。如果出现“sudo 不存在”，进入 root 会话安装 `sudo`，并确认用户属于 `wheel` 组。

## 6. 更新系统并安装基础工具

在普通用户的 AlmaLinux 终端执行：

```bash
sudo dnf upgrade --refresh -y
sudo dnf install -y git curl wget unzip zip tar nano
```

输入刚才的 Linux 密码。AlmaLinux 使用 `dnf`，不要照搬 Ubuntu 的 `apt` 命令。

## 7. 检查并启用 systemd

在 Linux 中检查 PID 1：

```bash
ps -p 1 -o comm=
```

输出 `systemd` 则不需要更改。否则执行：

```bash
sudo nano /etc/wsl.conf
```

添加或修改 `[boot]` 段，不要重复创建同名段，也不要覆盖其他配置：

```ini
[boot]
systemd=true
```

若同时设置默认用户，示例完整内容为：

```ini
[boot]
systemd=true

[user]
default=solo
```

保存后，在 PowerShell 执行：

```powershell
wsl --shutdown
wsl -d AlmaLinux-9
```

回到 Linux 验证：

```bash
ps -p 1 -o comm=
systemctl list-units --type=service --state=running
```

systemd 用于管理 Nginx、数据库等服务；仅启用它并不会自动安装 PHP、宝塔、MySQL 或 Redis。

## 8. 可选：限制内存，将交换文件放到 D 盘

在 Windows PowerShell 执行：

```powershell
New-Item -ItemType Directory -Force -Path "D:\WSL" | Out-Null
notepad "$env:USERPROFILE\.wslconfig"
```

对于 32GB 内存电脑，可从以下示例开始；已有文件应合并修改，不要覆盖其他配置：

```ini
[wsl2]
defaultVhdSize=300GB
memory=6GB
processors=4
swap=2GB
swapFile=D:\\WSL\\swap.vhdx
guiApplications=false
[experimental]
autoMemoryReclaim=gradual
```

| 配置 | 作用 |
| --- | --- |
| `memory=6GB` | WSL 2 内存上限，不是启动就固定占用 8GB |
| `defaultVhdSize` | WSL 2 默认占用磁盘空间 |
| `processors=4` | 最多使用 4 个逻辑处理器 |
| `swap=2GB` | 设置 2GB 交换空间 |
| `swapFile=...` | 交换文件存放到 D 盘，Windows 路径中的反斜杠需要转义 |
| `guiApplications=...` | 开关gui,节约内存 |
| `autoMemoryReclaim=gradual` | 逐步回收缓存内存，不等于停止服务或释放所有内存 |

16GB 内存电脑可以先用 `memory=4GB`。根据 PHP、数据库等实际负载调整。

文件必须叫 `.wslconfig`，不能叫 `.wslconfig.txt`。它位于 Windows 用户目录，对所有 WSL 2 发行版生效；`/etc/wsl.conf` 位于 Linux 内部，对单个发行版生效。

保存后在 PowerShell 重启 WSL：

```powershell
wsl --shutdown
wsl -d AlmaLinux-9
```

在 Linux 中检查：

```bash
free -h
nproc
swapon --show
```

## 9. 访问 Windows 代码并配置 PhpStorm

假设代码目录为 `D:\projects\18sui`，在 Linux 中执行：

```bash
cd /mnt/d/projects/18sui
ls
```

这是同一份文件，无需上传或同步。Linux `/www/wwwroot` 中另一份代码不会自动与它同步。

Windows 上的 PhpStorm：

1. “文件 → 打开”，选择 `D:\projects\18sui`。
2. `Ctrl + Alt + S`，进入“PHP → CLI 解释器 → … → ＋”。
3. 选择“从 Docker、Vagrant、VM、WSL、远程…”。
4. 选择 WSL，发行版选择实际安装的 AlmaLinux 9。
5. 填写 Linux 中的 PHP 可执行文件路径。

安装 PHP 后，可在 Linux 查询：

```bash
command -v php
php -v
```

如果通过宝塔安装 PHP，路径可能是 `/www/server/php/83/bin/php`，必须以实际路径为准。本文没有自动安装 PHP。

PHP 和 Composer 在 WSL 中执行；Node.js、npm 可以继续在 Windows 中执行。避免交替用两个系统的 npm 安装同一份 `node_modules`，其中的原生依赖可能与运行平台不匹配。

## 10. 常用命令

以下均在 Windows PowerShell 执行：

| 目的 | 命令 |
| --- | --- |
| 查看已安装发行版与架构 | `wsl -l -v` |
| 查看在线发行版 | `wsl --list --online` |
| 启动 AlmaLinux 9 | `wsl -d AlmaLinux-9` |
| 启动并进入 D 盘目录 | `wsl -d AlmaLinux-9 --cd "D:\projects"` |
| 查看运行中的发行版 | `wsl --list --running` |
| 停止单个发行版 | `wsl --terminate AlmaLinux-9` |
| 游戏前关闭全部 WSL | `wsl --shutdown` |
| 更新 WSL | `wsl --update` |

关闭窗口不一定会停止 Linux 后台服务。执行 `wsl --shutdown` 会停止全部 WSL 发行版及其中的服务，之后重新启动即可继续使用。

## 11. 常见问题

### A. 安装提示虚拟化相关错误

先检查 BIOS 虚拟化是否开启，并确认安装 WSL 后已经重启 Windows。若“虚拟机平台”未启用，可在管理员 PowerShell 执行：

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

完成后重启。不要仅凭错误关闭防火墙或其他系统保护。

### B. 没有 AlmaLinux-9 或下载失败

先执行 `wsl --update`，重新运行 `wsl --list --online`。如果下载通道失败，可尝试：

```powershell
wsl --install -d AlmaLinux-9 --location "D:\WSL\AlmaLinux9" --web-download
```

已安装成功的发行版不要重复安装。持续失败时，记录完整错误码，再按 AlmaLinux 官方 WSL 指南选择 Microsoft Store 或官方 `.wsl` 文件安装方式。

### C. 忘记 Linux 用户密码

在 PowerShell 以 root 进入：

```powershell
wsl -d AlmaLinux-9 -u root
```

在 Linux 内重置普通用户密码：

```bash
passwd solo
```

如果要重置 root 自身密码，执行 `passwd root`。不要重装系统或注销发行版来重置密码。

### D. 已安装在 C 盘，想迁移到 D 盘

先确认发行版名称，对重要数据做好备份，关闭使用该发行版的程序。在支持移动命令的新版 WSL 中执行：

```powershell
wsl -l -v
wsl --shutdown
wsl --manage AlmaLinux-9 --move "D:\WSL\AlmaLinux9"
```

将名称换成实际列表中的名称，目标不要使用已被另一发行版占用的目录。Linux 内部路径保持不变。若不识别 `--move`，先更新 WSL，不要手动移动虚拟磁盘。


## 12. 安装宝塔，如果你一直卡在下面的安装,我建议你更换ubuntu系统
1.先安装宝塔国际版,安装好后

由于 Linux 发行版的“极简主义”设计哲学,很多编译工具都没有,直接安装php,mysql,nginx等会失败.

所以,先要安装一些编译工具
````shell
sudo dnf groupinstall "Development Tools"

###mysql依赖
sudo dnf install -y libaio numactl-libs
sudo dnf install openssl-devel

###安装PHP依赖
dnf --enablerepo=crb install -y \
  yum gcc gcc-c++ make cmake autoconf automake libtool bison \
  pkgconf-pkg-config libxml2-devel openssl-devel sqlite-devel \
  oniguruma-devel libcurl-devel libzip-devel zlib-devel \
  bzip2-devel libpng-devel libjpeg-turbo-devel freetype-devel \
  libwebp-devel libicu-devel libxslt-devel readline-devel \
  libffi-devel gmp-devel

````


## 官方参考资料

本文命令根据以下官方资料整理。不同 WSL 版本的可用参数可能不同，以本机 `wsl --help` 为准。

- [微软：安装 WSL](https://learn.microsoft.com/zh-cn/windows/wsl/install)
- [微软：WSL 基本命令](https://learn.microsoft.com/zh-cn/windows/wsl/basic-commands)
- [微软：WSL 高级配置](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)
- [AlmaLinux：官方 WSL 安装指南](https://wiki.almalinux.org/documentation/wsl)
- [微软 WSL：移动发行版命令说明](https://github.com/microsoft/WSL/blob/master/localization/strings/en-US/Resources.resw)
- [JetBrains：在 PhpStorm 中使用 WSL](https://www.jetbrains.com/help/phpstorm/how-to-use-wsl-development-environment-in-product.html)


## 13.手机请求wsl里的服务

````shell
ipconfig 找出本机局域网ip 10.105.76.216

wsl hostname -I 找出wsl局域网ip 172.23.132.71

#管理员 PowerShell，将 Windows 的 8785 端口转发到 WSL 的 8785 端口：
netsh interface portproxy add v4tov4 listenaddress=10.105.76.216 listenport=8785 connectaddress=172.23.132.71 connectport=8785

#放行该端口，允许局域网设备访问：
New-NetFirewallRule -DisplayName "WSL API 8785" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8785 -RemoteAddress LocalSubnet

#查看windows转发了哪些端口
netsh interface portproxy show all   #结果是

#侦听 ipv4:                 连接到 ipv4:

#地址            端口        地址            端口
#--------------- ----------  --------------- ----------
#10.105.76.216   8080        172.23.132.71   8080
#10.105.76.216   81          172.23.132.71   81

# 删除转发
netsh interface portproxy delete v4tov4 listenaddress=10.105.76.216 listenport=8080

# 清空转发
netsh interface portproxy reset

````