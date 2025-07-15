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
import { foreign_DATA } from '/.vitepress/theme/untils/navigation_data/foreign';
import { ref, onMounted } from 'vue';

const pwd=ref('');

onMounted(()=>{
    const urlParams = new URLSearchParams(window.location.search);
    pwd.value = urlParams.get('pwd') || '未找到参数';
    
    
});
function secret() {
  alert('想都别想');
}
</script>


::: tip 说明
**习得一门语言的唯一正确方法是海量听读可理解的材料**

  -- `世界语言学家 Dr. Krashen`
<br><br>
**把自己当成一个三岁小孩,大量并且反复的去听读材料,磨耳朵**

-- `Ruby`

:::


《[成年人如何正确地从零开始学英语](https://www.douban.com/note/849148995/?_i=0899783RTnDSzj,2584395YATjYR2)》

《[英语16大时态，一张图彻底搞懂](https://zhuanlan.zhihu.com/p/171702069)》

《[7张图搞懂16种英语时态干货](https://www.bilibili.com/opus/700872181035302962)》


<MNavLinks v-for="{title, items} in foreign_DATA" :title="title" :items="items"/>

## 跟侯总学外语
<p >
<button style="background-color: #F8DC75;font-weight: 600;
    width: 100px;height:30px;border-radius: 5px;margin-right: 5px;" @click="secret()">
        入口
    </button>


</p>