---
releaseTime: 2025/5/28
original: true
prev: false
next: false
sidebar: true
comment: false  
---

# 如何使用git进行多人协助
> 我遇到工作多年的同行,发现他们在使用Git协同开发这一块的管理那是相当混乱.
> 让我感觉到,有些人可能真就是把一年工作经验用了多年

## 正常流程

dev 👉 test 👉 master

* 当你需要开发某个功能的时候,比如登录功能,先从 `master`分支 拉出一条新的纯净的线
````
git checkout -b login
````
* 开发完成后,合并到`test`以供测试人员进行测试验收
````
git checkout test 
git merge login 
git push
````
* 测试人员验收后,合并到 `master`
````
git checkout master 
git merge login 
git push
````

`可以删除 login 分支了,避免太多分支混乱`

✅ 流程结束,等待运维发布


## 👉 [bug修复](https://liaoxuefeng.com/books/git/branch/bug/index.html)

bug是无法避免的


## 协同开发
上级要求你和张三共同开发某功能或是修改某Bug,于是你们命名代号为 `101`

````
git checkout master
git checkout -b issue-101
git add . && git commit -m "issue-101 init" && git push

于是两人就可以在 issue-101 上面开发或是修改.
````





