# UniPush 2.0：iOS APNs 推送证书制作与兼容性修复（Windows + Git Bash + OpenSSL）

> **实际验证结果**：本次项目在 UniPush 后台上传普通 OpenSSL 导出的 `apns.p12` 时提示“证书校验出错”；使用相同的苹果 APNs 证书、相同私钥，按本文导出兼容格式的 `apns_compatible.p12` 后，**已上传并测试成功**。
>
> 适用：Windows、Git Bash（UCRT64）、OpenSSL、HBuilderX / uni-app、UniPush 2.0、苹果普通开发者账号。
>
> 文档日期：2026-11-13。控制台名称和界面可能更新，以官方页面为准。

## 1. 一句话区别：IPA 签名证书 ≠ APNs 推送证书

| 文件 | 作用 | 使用位置 | 能否互相替代 |
|---|---|---|---|
| `development.p12` | 给开发测试版 IPA **代码签名** | HBuilderX iOS 云打包 | 不能当推送证书 |
| `ipay_development.mobileprovision` | 描述 App ID、开发设备和签名授权 | HBuilderX iOS 云打包 | 不是 P12 |
| `distribution.p12`（未来制作） | 给分发构建签名 | HBuilderX 对应分发方式 | 不能当推送证书 |
| `apns.p12` / `apns_compatible.p12` | APNs 服务端 TLS 认证，让推送平台连接苹果 APNs | UniPush 后台 iOS 证书配置 | **不能用于 IPA 代码签名** |

**记忆口诀**：IPA 打包用 `development.p12`（或正式分发的 `distribution.p12`），UniPush 推送用 `apns_compatible.p12`。

## 2. 本次项目的实际目录结构

```text
D:\doc\wallet\ios证书\ipay_new\
├── apple.key
├── apple.csr
├── development.cer
├── development.pem
├── development.p12                 # IPA 开发签名
├── ipay_development.mobileprovision # IPA 开发描述文件
└── apns\
    ├── apns.key                    # 推送证书的私钥，务必备份
    ├── apns.csr                    # 推送证书请求文件
    ├── apns.cer                    # 苹果下发的 APNs 证书
    ├── apns.pem                    # 由 .cer 转换而来
    ├── apns.p12                    # OpenSSL 默认格式：本次平台不兼容
    └── apns_compatible.p12         # 兼容格式：本次已测试成功
```

这两个 P12 的文件扩展名相同，是因为都使用 PKCS#12 容器格式；但里面的证书用途不同。

## 3. 在苹果开发者后台开启 Push Notifications

1. 打开 [Identifiers](https://developer.apple.com/account/resources/identifiers/list)。
2. 选择需要推送的 App ID。本次项目的 Bundle ID 是 `com.ipay.new`。
3. 在 Capabilities 勾选 **Push Notifications**，保存。
4. 如果原开发描述文件创建于开启推送之前，重新生成或刷新对应的 `iOS App Development` 描述文件并下载；原 `development.p12` 通常可以继续用。
5. 确保签名后的 App Entitlements 包含 `aps-environment`：开发环境一般是 `development`，正式分发一般是 `production`。

> **注意**：截图中的 `Broadcast Capability` 不是普通 APNs 通知所必需的功能。普通消息推送主要需要 `Push Notifications`。

## 4. 在苹果后台创建 APNs 证书

1. 打开 [Certificates](https://developer.apple.com/account/resources/certificates/list)，点击 `+`。
2. 选择 **Apple Push Notification service SSL (Sandbox & Production)**（界面名称可能变化）。
3. 选择正确的 App ID：`com.ipay.new`。
4. 进入上传 CSR 页面。
5. 在 Windows 生成新的 `apns.key` 和 `apns.csr`，将 CSR 上传给苹果。
6. 下载苹果签发的证书，命名为 `apns.cer`。

本次在苹果证书详情页看到：

- **Certificate Type：Apple Push Services**
- **Certificate Name：com.ipay.new**

这是 APNs 推送证书，不是 `Apple Development` 或 `Apple Distribution` 的 IPA 签名证书。

## 5. Windows / Git Bash 生成 APNs CSR

打开 Git Bash（UCRT64）：

```bash
cd '/d/doc/wallet/ios证书/ipay_new'
mkdir -p apns
cd apns
```

生成独立私钥：

```bash
openssl genrsa -out apns.key 2048
```

生成 CSR：

```bash
MSYS_NO_PATHCONV=1 openssl req -new \
  -key apns.key \
  -out apns.csr \
  -subj '/emailAddress=your-developer-email@example.com/CN=Apple Push Notification/C=CN'
```

将邮箱改成自己的邮箱。CSR 中的邮箱不一定必须和开发者账号邮箱一致；但推荐使用便于管理的邮箱。`C=CN` 是示例国家代码，按需更改。

验证 CSR：

```bash
openssl req -in apns.csr -noout -subject -verify
```

成功应看到 `Certificate request self-signature verify OK`。

**Git Bash 常见坑**：如果直接写 `-subj '/emailAddress=...'`，MSYS/Git Bash 可能把 `/emailAddress` 当路径转成 `D:/.../emailAddress`，导致 `subject name is expected...`。使用命令前面的 `MSYS_NO_PATHCONV=1` 可避免这一问题。**不要使用 `//emailAddress` 代替**，这可能产生 `Skipping unknown subject name attribute "/emailAddress"` 警告，跳过邮箱字段。

## 6. 将 APNs CER 转成 PEM，导出普通 P12

将从苹果下载的 `apns.cer` 放入 `apns/` 目录，然后执行：

```bash
openssl x509 -inform DER -in apns.cer -out apns.pem
```

初次普通导出：

```bash
openssl pkcs12 -export \
  -inkey apns.key \
  -in apns.pem \
  -out apns.p12
```

设置并确认 P12 导出密码。该密码是 **UniPush 后台“证书密码”要填写的密码**，不是 Apple ID 密码。

### 6.1 本次遇到的错误

虽然 OpenSSL 能正常打开 `apns.p12`，UniPush 后台上传后却提示：

```text
证书校验出错
```

本次普通 P12 输出包含：

```text
MAC: sha256, Iteration 2048
PKCS7 Encrypted data: PBES2, PBKDF2, AES-256-CBC
Shrouded Keybag: PBES2, PBKDF2, AES-256-CBC
```

**判断**：普通 P12 本身没有损坏。根据重新导出后的实际测试，UniPush 后台的某个证书校验环节对默认 OpenSSL 3 导出的现代 PKCS#12 加密格式可能存在兼容性问题。由于没有平台内部日志，这个兼容性原因是**高度合理的推断，而非后台厂商已确认的根因**。

## 7. 已验证成功的修复：导出兼容格式 P12

**不需要重新申请 APNs 证书，不需要重新创建 CSR，也不需要吊销原证书。**

保留现有 `apns.key` 和 `apns.pem`，在 `apns/` 目录执行：

```bash
openssl pkcs12 -export \
  -inkey apns.key \
  -in apns.pem \
  -out apns_compatible.p12 \
  -keypbe PBE-SHA1-3DES \
  -certpbe PBE-SHA1-3DES \
  -macalg sha1 \
  -iter 2048
```

然后输入并确认你选择的导出密码。

验证：

```bash
openssl pkcs12 -in apns_compatible.p12 -info -noout
```

成功解密后，通常显示类似：

```text
MAC: sha1, Iteration 2048
PKCS7 Encrypted data: pbeWithSHA1And3-KeyTripleDES-CBC
Certificate bag
PKCS7 Data
Shrouded Keybag: pbeWithSHA1And3-KeyTripleDES-CBC
```

**本次实际结果**：上传 `apns_compatible.p12` 后，UniPush 后台测试成功，解决了原先“证书校验出错”的问题。

> 安全提示：这里使用旧式 SHA-1/3DES 只是为兼容旧解析器的封装格式，并未更改苹果证书和 RSA 私钥。只在可信推送服务后台上传该兼容文件，妥善保管私钥和密码。若未来平台支持现代格式，优先使用现代加密 P12 或官方支持的 P8 Token 认证方式。

## 8. 推送证书核验命令（无需泄露私钥）

### 8.1 检查 P12 密码与格式

```bash
openssl pkcs12 -in apns_compatible.p12 -info -noout
```

正常解密说明输入的密码能打开 P12；**还需检查证书用途、Bundle ID 等，不能只凭密码正确就认定能推送**。

### 8.2 检查 CER 与 KEY 是否匹配

计算证书的公钥摘要：

```bash
openssl x509 -in apns.pem -pubkey -noout | openssl sha256
```

计算私钥对应的公钥摘要：

```bash
openssl pkey -in apns.key -pubout | openssl sha256
```

**两条 SHA256 输出必须一致**。本次实际截图中两条输出一致，证明证书和私钥匹配。

### 8.3 查看证书详情与有效期

```bash
openssl x509 -in apns.pem -noout -subject -issuer -dates
openssl x509 -in apns.pem -noout -text
```

检查证书是否确实为 APNs 证书、是否已过期，以及其主体与 Bundle ID 是否匹配。苹果后台查看证书类型可能更直观。

### 8.4 查看开发描述文件中的推送权限

先在开发描述文件所在目录执行：

```bash
openssl cms -verify \
  -inform DER \
  -in ipay_development.mobileprovision \
  -noverify \
  -out profile.plist
```

打开 `profile.plist`，找到 `Entitlements` 下的：

```xml
<key>aps-environment</key>
<string>development</string>
```

开发测试一般为 `development`，分发包通常为 `production`。如无该字段，核实 App ID 是否开启 Push Notifications 并重新生成描述文件。`-noverify` 跳过了签名链验证，仅用于查看内容，**不意味着已经完成安全验证**。

## 9. UniPush 后台怎样填写

进入 DCloud 开发者中心 / UniPush 对应应用的 iOS 证书配置页：

| 字段 | 本次参考填写 |
|---|---|
| 证书类型 | `p12` |
| 文件 | `apns_compatible.p12` |
| 证书密码 | 生成兼容 P12 时输入的密码 |
| Bundle ID | `com.ipay.new`，必须与苹果证书和项目设置一致 |
| 证书环境 | 依证书支持范围及后台提示选择；本次证书属于 Apple Push Services（Sandbox & Production），通常可选择后台的“通用环境” |

**注意**：UniPush 的“开发环境 / 通用环境”选项是平台配置项，不等同于 IPA 的签名类型。真正向 APNs 发送时仍应区分设备令牌所属 Sandbox 或 Production 环境，以平台的测试结果和当前规则为准。

本次已通过上传兼容 P12 的测试；无需为此修改 `development.p12`。

## 10. HBuilderX 打包 IPA 使用哪个 P12？

在 HBuilderX 的 iOS 云打包中，针对当前开发测试 IPA：

```text
签名证书：development.p12
描述文件：ipay_development.mobileprovision
Bundle ID：com.ipay.new
```

**不要将 `apns_compatible.p12` 用作 IPA 代码签名证书。**

开启 UniPush / Push 功能后，确认对应的开发描述文件包含 `aps-environment` 权限，并重新打包包含推送原生模块的 IPA。若以后使用 Ad Hoc、TestFlight、App Store 等方式，应搭配适当的发布证书和发布描述文件。

## 11. 常见报错对照

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `证书校验出错`，但 OpenSSL 可读 | P12 加密格式与平台解析器不兼容 | 用第 7 节兼容格式重新导出（本次有效） |
| `Mac verify error` / 密码错误 | 输入的 P12 密码不一致 | 本地先用第 8.1 节确认密码；必要时重新导出 |
| P12 导出报证书/密钥不匹配 | `apns.key` 与 `apns.cer` 不是配对文件 | 比较第 8.2 节 SHA256 摘要；不匹配则找回原私钥或重建证书 |
| 证书上传成功却无法推送 | Bundle ID 不一致 | 校验 Apple App ID、DCloud 应用配置、HBuilderX Bundle ID |
| 真机未获取到推送 token 或通知不出现 | App 缺推送 Entitlement、未授权、推送环境不匹配等 | 重新制作描述文件并检查 `aps-environment`、通知授权和客户端日志 |
| Git Bash 把 `/emailAddress` 识别成路径 | MSYS 参数路径转换 | 使用 `MSYS_NO_PATHCONV=1` |
| 上传使用了 `development.p12` | 误把 IPA 签名证书当 APNs 证书 | 换成 `apns_compatible.p12` |

### 排查优先顺序

1. 确认 `Apple Push Services` 证书绑定正确的 Bundle ID。
2. 用 `openssl pkcs12 -info -noout` 测试 P12 密码。
3. 用公钥 SHA256 确认 CER 与 KEY 匹配。
4. 若默认 P12 上传失败，使用第 7 节兼容格式导出。
5. 仍失败则核实证书有效期、UniPush 环境配置，并联系 DCloud/个推提供错误时间与脱敏日志；不要盲目吊销证书。

## 12. 到期更新与多项目管理

- **APNs 证书通常与特定 App ID 关联**。不同 Bundle ID 的 App，使用证书方式时通常分别申请 APNs 证书、分别配置 UniPush；不要直接把一个项目的 APNs P12 上传给另一个项目。
- **开发签名 P12** 可以在同一团队内用于不同项目的代码签名，但各项目的 Explicit App ID、描述文件通常不同。
- APNs 证书**有过期日**，到期前应申请更新并重新上传对应推送平台；不要等线上推送失败才处理。
- 苹果还支持基于 `.p8` 的 APNs Auth Key；如果你的推送平台支持，长期维护时可评估使用它，具体 Team ID、Key ID、Bundle ID 要分别配置。
- 不需要把 UniPush 依赖的密钥放在客户端代码里。AppSecret、MasterSecret、P12、私钥及密码都属于敏感凭据，应该限制访问并妥善备份。
- 如果后台页面截图或代码仓库曾暴露 AppSecret、MasterSecret，应评估轮换，避免被恶意调用。

## 13. 官方参考链接

- [Apple Developer — Certificates](https://developer.apple.com/account/resources/certificates/list)
- [Apple Developer — Identifiers](https://developer.apple.com/account/resources/identifiers/list)
- [Apple Developer — Profiles](https://developer.apple.com/account/resources/profiles/list)
- [Apple Developer — APNs 概览](https://developer.apple.com/documentation/usernotifications/establishing-a-remote-notification-server)
- [DCloud — UniPush 2.0](https://uniapp.dcloud.net.cn/unipush-v2.html)
- [OpenSSL — pkcs12 命令文档](https://docs.openssl.org/3.0/man1/openssl-pkcs12/)

---

## 14. 最短复现备忘（供下次直接复制）

**已有 `apns.key` 和 `apns.pem`，且普通 `apns.p12` 上传 UniPush 报“证书校验出错”时：**

```bash
cd '/d/doc/wallet/ios证书/ipay_new/apns'

openssl pkcs12 -export \
  -inkey apns.key \
  -in apns.pem \
  -out apns_compatible.p12 \
  -keypbe PBE-SHA1-3DES \
  -certpbe PBE-SHA1-3DES \
  -macalg sha1 \
  -iter 2048

openssl pkcs12 -in apns_compatible.p12 -info -noout
```

然后上传 `apns_compatible.p12` 到 UniPush 的 **iOS 推送证书配置**，填写新导出密码。本次按此方法已通过测试。

**IPA 打包仍使用 `development.p12` + `ipay_development.mobileprovision`。**
