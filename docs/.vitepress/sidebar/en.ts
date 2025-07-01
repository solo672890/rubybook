import { DefaultTheme } from 'vitepress'
export const enSidebar: DefaultTheme.Sidebar = {
    '/en/': [
        {
            text: 'Guide',
            collapsed: false,
            items: [
                { text: 'guide', link: `/en/guide/` },
                { text: 'quick started', link: `/en/quick-started/` },
                { text: 'reference', link: `/en/reference/` },
            ]
        },
        {
            text: 'API',
            collapsed: false,
            items: [
                { text: 'guide', link: `/en/abc/` },
                { text: 'quick started', link: `/en/bca/` },
            ]
        },
    ]
}