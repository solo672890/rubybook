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
import { NAV_DATA } from '/.vitepress/theme/untils/data';
import { WEB_DATA } from '/.vitepress/theme/untils/navigation_data/web'
</script>





<MNavLinks v-for="{title, items} in WEB_DATA" :title="title" :items="items"/>