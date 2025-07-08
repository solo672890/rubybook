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
import { NAV_DATA } from '/.vitepress/theme/untils/data'
</script>


# php源码



<MNavLinks v-for="{title, items} in NAV_DATA" :title="title" :items="items"/>