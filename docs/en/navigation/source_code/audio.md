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
import { AUDIO_DATA } from '/.vitepress/theme/untils/navigation_data/audio'
</script>





<MNavLinks v-for="{title, items} in AUDIO_DATA" :title="title" :items="items"/>