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
import { PHP_DATA } from '/.vitepress/theme/untils/navigation_data/php'
</script>
[大话设计模式 PHP版本](https://www.bookstack.cn/books/flyingalex-design-patterns-by-php)


<MNavLinks v-for="{title, items} in PHP_DATA" :title="title" :items="items"/>

