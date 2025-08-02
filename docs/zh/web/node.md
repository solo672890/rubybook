---
releaseTime: 2024/3/05
original: true
prev: false
next: false
editLink: true
---
# php




## 安装node多版本

`需要先下载nvm(Node版本管理工具),多版本安装工具`

[💾下载地址](https://github.com/coreybutler/nvm-windows/releases) 选择 nvm-setup.exe

::: details 查看
1 解压后创建你的nodejs和dev目录,并创建以下两个文件
![LOGO](/public/document/node1.jpg)

2 把nvm-noinstall.zip解压后的文件,复制到nvm文件里,以管理员的身份打开install.cmd,回车后会弹出txt文件
![LOGO](/public/document/node2.jpg)

3 在setting.txt里按照如下填写第一步新创建的2个文件地址
root: E:\nodejs\dev\nvm
path: E:\nodejs\dev\nodejs   //你的nodejs存放地址
arch: 64
proxy: none
node_mirror:npm.taobao.org/mirrors/node/
npm_mirror:npm.taobao.org/mirrors/npm/

4 系统环境变量配置,2个环境变量
NVM_HOME:E:\nodejs\dev\nvm
NVM_SYMLINK:E:\nodejs\dev\nodejs
![LOGO](/public/document/node3.jpg)
![LOGO](/public/document/node4.jpg)

nvm(Node版本管理工具)安装完毕

5 测试,下载nodejs以及版本选择

win+r 拉起cmd ,输入
``````
nvm version  //查看版本号
nvm  list       //查看安装的版本
nvm list available  //查看有哪些版本
nvm install latest //下载nodejs最新版本, 会在当前nvm路径下安装并下载
nvm install 7.10.0
``````
接下来选择版本,
``````
nvm use 7.10.0  //你要选择的版本
nvm  list
node -v           //出现版本号,说明nodejs安装成功
``````
:::