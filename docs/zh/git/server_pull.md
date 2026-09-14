---
releaseTime: 2025/5/28
original: true
prev: false
next: false
sidebar: true
comment: false  
---

# 如何使用git进行多人协助
> 一般在服务端拉取代码都采用git pull, 但是由于各种原因会导致冲突.这对一个已经上线的产品来说是一个灾难.
> 即便在测试服上,解决冲突也是一个令人讨厌的事情


````shell
# 即便服务端未执行git add. 能执行该命令
# 恢复到指定版本
git fetch origin

# origin/main是你的仓库的主分支, main是服务端的主分支
git reset --hard origin/main
````


`





