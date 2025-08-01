---
releaseTime: 2024/3/05
original: true
prev: false
next: false
editLink: true
---
# php




## 安装

`最近几乎只使用webman框架,他并不需要fpm模式,只需要cli即可,那么只需要下载php cli解释器.`

`这样操作,安装快捷,占用空间小`

<a href="/public/file/php-8.4-linux-x86_64.tar.gz" download="php-8.4-linux-x86_64.tar.gz">
  💾  php-cli 文件
</a>
<a href="/public/file/install-php-and-composer" download="install-php-and-composer">
  💾 自动安装脚本
</a>

::: code-group



````php [快捷安装]
# 文档地址:https://www.workerman.net/download
curl -sO https://www.workerman.net/install-php-and-composer && sudo bash install-php-and-composer


````

```` php[手动安装]
### php cli 安装 将cli文件丢入 /root/software/php

vim /etc/profile
追加 export PATH=$PATH:/root/software/php
source /etc/profile

### 安装composer
curl -# -O https://download.workerman.net/php/composer.phar
sudo mv composer.phar /usr/local/bin/composer
sudo chmod a+x /usr/local/bin/composer


### 自动指定php.ini
php --ini
Configuration File (php.ini) Path: /usr/local/etc/php
Loaded Configuration File:         (none)
Scan for additional .ini files in: /usr/local/etc/php/conf.d
Additional .ini files parsed:      (none)

把php.ini放在 /usr/local/etc/php 即可
mkdir -p /usr/local/etc/php &&  cp server_install/php-cli/php.ini /usr/local/etc/php


### 手动指定php.ini路径
php -c /path/to/your/php.ini start.php start

````


