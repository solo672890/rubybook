import { DefaultTheme } from 'vitepress'
export const enSidebar: DefaultTheme.Sidebar = {
    '/en/': [
        {
            text: 'Guid1e',
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
    ],
    "/en/navigation/": { base: "/navigation/", items: sidebarEnNavigation() },
}

function sidebarEnNavigation(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: "navigation",
            collapsed: false,
            items: [
                { text: "php", link: "source_code/php" },
                { text: "web", link: "source_code/web" },
                { text: "UI", link: "source_code/ui" },
                { text: "tool", link: "source_code/tool" },
                { text: "entertainment", link: "source_code/audio" },
                { text: "foreign language", link: "source_code/foreign" },
            ],
        },


    ];
}