import { enNav } from '../navbar'
import { enSidebar } from '../sidebar'

import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {

    themeConfig: { // 主题设置
        //上次更新时间
        lastUpdated: {
            text: 'last updated',
            formatOptions: {
                dateStyle: 'short', // 可选值full、long、medium、short
                timeStyle: 'short' // 可选值full、long、medium、short
            },
        },
        returnToTopLabel: 'top', // 更改手机端菜单文字显示
        //编辑本页
        editLink: {
            pattern: 'https://github.com/Yiov/vitepress-doc/edit/main/docs/:path', //todo 改成自己的仓库
            text: 'edit this page on github'
        },
        nav: enNav,
        sidebar: enSidebar, // 侧边栏
        docFooter: { // 自定义上下页名
            prev: 'prev', next: 'next'
        },
        darkModeSwitchLabel: 'depth mode', // 手机端深浅模式文字修改
        footer: { // 页脚
            message: 'Released under the MIT License.',
            copyright: `Copyright © 2019-${new Date().getFullYear()}`
        },
        outline: { // 大纲显示 1-6 级标题
            level: [1, 6],
            label: 'catalogue'
        },

        sidebarMenuLabel: '目录11'
    }
}