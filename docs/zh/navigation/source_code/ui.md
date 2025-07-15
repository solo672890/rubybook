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
import { UI_DATA } from '/.vitepress/theme/untils/navigation_data/ui'
</script>





<MNavLinks v-for="{title, items} in UI_DATA" :title="title" :items="items"/>