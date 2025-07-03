import { zhNav } from '../navbar'
import { zhSidebar } from '../sidebar'
import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'
// import { loadEnv } from 'vite'
// const { VITE_BASE_URL } = loadEnv(process.env.NODE_ENV, process.cwd())
export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {

    themeConfig: { // 主题设置

        //上次更新时间
        lastUpdated: {
            text: '上次更新',
            formatOptions: {
                dateStyle: 'short', // 可选值full、long、medium、short
                timeStyle: 'short' // 可选值full、long、medium、short
            },
        },
        returnToTopLabel: '返回顶部', // 更改手机端菜单文字显示
        //编辑本页
        editLink: {
            pattern: 'https://github.com/solo672890/rubybook/edit/main/docs/:path', //todo 改成自己的仓库
            text: '在github上修改'
        },
        nav: zhNav,
        sidebar: zhSidebar, // 侧边栏
        docFooter: { // 自定义上下页名
            prev: '上一篇', next: '下一篇'
        },
        darkModeSwitchLabel: '深浅模式', // 手机端深浅模式文字修改
        footer: { // 页脚
            message: 'Released under the MIT License.',
            copyright: `Copyright © 2019-${new Date().getFullYear()}`
        },
        outline: { // 大纲显示 1-6 级标题
            level: [1, 6],
            label: '目录'
        },


        sidebarMenuLabel: '目录1',

    }
}