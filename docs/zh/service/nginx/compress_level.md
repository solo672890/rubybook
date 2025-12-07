---
releaseTime: 2025/9/18
original: false
prev: false
next: false
sidebar: false
comment: false  
---

# nginx压缩级别设置


<Linkcard url="https://www.clicksun.net/mis/bbs/showbbs.asp?id=33449" title="转载:我猜你网站的 nginx 压缩......"  logo="/svg/stackblitz_logo.svg"/>

`nginx gzip可以压缩网页和json的体积`

**可以查看原文,我在这里记录下他的总结**

* 追求较高压缩比且服务器CPU资源充足：可尝试级别7
* 希望平衡压缩效果与服务器负载，级别6是稳妥的选择
* 服务器CPU资源紧张或主要压缩大文件，级别5也能提供不错的压缩效果，同时CPU负担更轻

````
server{
    gzip on;
    gzip_buffers 32 4K;
    gzip_comp_level 5;
    gzip_min_length 100; # 最小压缩长度(byte)
    gzip_types application/javascript text/css text/xml application/json;;
    gzip_vary on;
}

````
