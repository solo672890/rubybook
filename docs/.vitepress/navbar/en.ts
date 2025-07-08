import { DefaultTheme } from 'vitepress'

// 英文导航
export const enNav: DefaultTheme.NavItem[] = [
    {
        text: '🍉guide',
        items: [
            {
                // 分组标题1
                text: '介绍',
                items: [
                    { text: '前言', link: '/preface' },
                ],
            },
            {
                // 分组标题2
                text: '基础设置',
                items: [
                    { text: '快速上手', link: '/getting-started' },
                    { text: '配置', link: '/configuration' },
                    { text: '页面', link: '/page' },
                    { text: 'Frontmatter', link: '/frontmatter' },
                ],
            },
            {
                // 分组标题3
                text: '进阶玩法',
                items: [
                    { text: 'Markdown', link: '/markdown' },
                    { text: '团队', link: '/team' },
                    { text: '多语言', link: '/multi-language' },
                    { text: 'DocSearch', link: '/docsearch' },
                    { text: '静态部署', link: '/assets' },
                    { text: '样式美化', link: '/style' },
                    { text: '组件', link: '/components' },
                    { text: '布局插槽', link: '/layout' },
                    { text: '插件', link: '/plugin' },
                    { text: '更新及卸载', link: '/update' },
                    { text: '搭建导航', link: '/nav/' },
                    { text: '永久链接', link: '/permalink/' },
                ],
            },
        ],
    },
    { text: 'navigation', link: '/navigation' },
    { text: 'update log', link: '/en/updateLog' },
]