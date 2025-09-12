---
releaseTime: 2023/7/1
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# union all测评

`60G_SSD 8G内存 4核CPU`

`1亿2千万+`条数据,6表联查,114条查询结果,全走索引,耗时`0.075s`

本来想搞个三亿数据测试一下的,但是磁盘不够了

如果使用魔改mysql or 社区版 or oracle,这个结果会更好
![union all测试](/document/mysqlTest_unionAll0.png)
<br>
![union all测试](/document/mysqlTest_unionAll1.png)

