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

## javascript
[《现代 JavaScript 教程》](https://zh.javascript.info/) --置顶

[ECMAScript 6 入门](https://es6.ruanyifeng.com/#docs/class) --阮一峰

## vue
[一文看懂vue3中setup()和 ＜script setup＞的区别以及父子传参的变化](https://blog.csdn.net/u013505589/article/details/122718376?spm=1001.2014.3001.5502) --csdn

[electron+Vue3 + vite + Ts + pinia+实战+源码 ](https://www.bilibili.com/video/BV1dS4y1y7vd/?vd_source=b8719e53a0544cc942f16429afc45fdc) --哔哩哔哩

## css
[CSS中的块级元素、行内元素和行内块元素](https://blog.csdn.net/swebin/article/details/90405950) --csdn

[Flex 布局](https://zhuanlan.zhihu.com/p/25303493) --知乎

[CSS 定位布局 - 相对、绝对、固定三种定位](https://www.jianshu.com/p/234c14df8c52) --简书

<MNavLinks v-for="{title, items} in WEB_DATA" :title="title" :items="items"/>