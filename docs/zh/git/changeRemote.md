---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: true
comment: false  
---

# 如何更换远程库
> 某一次项目移交到我手里,本地和服务器都需要更换远程库

## 本地更换
### 查看本地关联的远程地址
```` ts
git remote -v
````

### 更改成新的远程仓库地址
```` ts
git remote set-url origin https://github.com/yourname/your-repo.git

// 如果你用 SSH：
git remote set-url origin git@github.com:yourname/your-repo.git
````
### 把本地代码推送上去
```` ts
git push -u origin main

// 推送所有本地分支：
git push --all origin

//推送所有标签（如果你有打 tag）
git push --tags origin
````

### 推送报错?
```` ts
git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/xxxxxxx/xxxxx.git'

本地没有名为 main 的分支，所以 Git 无法推送
git branch   //查看本地分支
````

## 服务器上更换
````
git remote set-url origin https://github.com/yourname/your-repo.git

// 如果你用 SSH：
git remote set-url origin git@github.com:yourname/your-repo.git
````

## pull时报错?
git pull 会让你输入username和password,然后会报错

`remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/xxx/xxxxx.git/'`

自 2021 年 8 月起，GitHub 已全面禁用账号密码验证 Git 操作。

### ✅ 解决方案一：生成并使用 Personal Access Token（推荐）

**📌 步骤 1：生成 Token**
* 登录 GitHub → 点右上角头像 → Settings
* 左侧菜单 → Developer settings
* → Personal access tokens → Tokens (classic)（或新版 Tokens）
* 点击 Generate new token → Generate new token (classic)
* 填写：
 * Note（备注）：git pull/push token（随便写）
 * Expiration（过期时间）：选 No expiration（或按需）
 * Scopes（权限）：✅ 勾选 repo（必须！否则无法读写仓库）
* 点击 Generate token
* ⚠️ 复制生成的 token（只显示一次！）
* 🔐 Token 看起来像：ghp_AbC1xYz2AbC3xYz4AbC5xYz6AbC7xYz8

**📌 步骤 2：使用 Token 执行 git pull**

下次执行 git pull 或 git push 时：
`设置后，第一次输入用户名 + token，以后 Git 会自动记住。`
* Username：输入你的 GitHub 用户名（如 solo672890）
* Password：粘贴你刚才复制的 Token（不是你的 GitHub 登录密码！）
✅ 就能成功了！

### ✅ 解决方案二：配置 Git 凭据缓存（避免每次输入）
每次输 token 很麻烦？可以缓存起来：

* Windows：
````
git config --global credential.helper manager
# 或新版：
git config --global credential.helper manager-core
````

* Linux：
````
git config --global credential.helper cache
````

### ✅ 解决方案三：改用 SSH（一劳永逸，推荐开发者使用）
SSH 不需要每次输 token，更安全方便
* 📌 步骤 1：检查是否已有 SSH Key
````
ls -al ~/.ssh
````

* 📌 步骤 2：没有？生成一个：
````
ssh-keygen -t ed25519 -C "your_email@example.com"
# 或
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
````
一路回车即可。

* 📌 步骤 3：添加公钥到 GitHub
````
cat ~/.ssh/id_ed25519.pub
# 或
cat ~/.ssh/id_rsa.pub
````
`复制输出内容 → 登录 GitHub → Settings → SSH and GPG keys → New SSH key → 粘贴 → Add`

* 📌 步骤 4：更改远程仓库地址为 SSH
````
git remote set-url origin git@github.com:solo672890/pay-api-admin.git
````

* 📌 步骤 5：测试连接
````
ssh -T git@github.com    // 一定要输入yes

// 输出: Hi solo672890! You've successfully authenticated...
````
✅ 之后 git pull / git push 再也不用输用户名密码！