---
original: true
layout: doc
layoutClass: m-nav-layout
prev: false
next: false
outline: [2, 3, 4]
---

<style src="/.vitepress/theme/style/nav.css"></style>

<script setup>
import { OAM_DATA } from '/.vitepress/theme/untils/navigation_data/oam';

</script>


[《linux 多种方法 批量杀死进程（总有一款适合你）》](https://blog.csdn.net/littleRpl/article/details/89641993)



<MNavLinks v-for="{title, items} in OAM_DATA" :title="title" :items="items"/>

