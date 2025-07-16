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
import { learning_forum_DATA } from '/.vitepress/theme/untils/navigation_data/learning_forum';

</script>







<MNavLinks v-for="{title, items} in learning_forum_DATA" :title="title" :items="items"/>

