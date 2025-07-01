import { DefaultTheme } from 'vitepress'
export const zhSidebar: DefaultTheme.Sidebar = {
    '/': [
        {
            text: '使用指南',
            collapsed: false,
            items: [
                { text: '简介', link: `/guide/` },
                { text: '快速开始', link: `/quick-started/` },
                { text: '参考', link: `/reference/` },
            ]
        },
        {
            text: 'API',
            collapsed: false,
            items: [
                { text: '简介', link: `/abc/` },
                { text: '快速开始', link: `/bca/` },
            ]
        },
    ]
}