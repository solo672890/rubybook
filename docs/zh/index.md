---
layout: home

title: RubyBook
titleTemplate: 中小型IT项目指南
description: 中小型IT项目指南 | 结构化、体系化的技术知识内容分享与创作
hero:
  name: RubyBook
  text: "中小型IT项目指南"
  tagline:  多年项目经验汇聚成一套入门中级架构师的武林秘籍
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: RubyBook是什么?
      link: /theory/whatsRubyBook
    - theme: alt
      text: 快速开始
      link: /service/linux

features:
  - icon: 📝
    title: 专注于IT内容
    details: 包含内容广泛,服务端,客户端,渗透等
  - icon: 🚀
    title: 资源分享
    details: 各种资源....懂的都懂,不懂的说了也不懂.
    link: 🚀
    linkText: go
  - icon: 🗄️
    title: 代码即文档
    details: 关键场景附带可运行的代码片段（如Python脚本、Shell命令）
  - icon: 💬
    title: 轻量级思维-
    details: 聚焦中小型项目特性，避免过度设计与复杂架构。
---
<script setup>
import { PHP_DATA } from '/.vitepress/theme/untils/navigation_data/php';
import { zhNav } from '/.vitepress/navbar/zh';

zhNav.push({text: '联系我', link: '/navigation/source_code/php'})
console.log(zhNav)
</script>
<HomeUnderline />

<confetti />

<busuanzi />

