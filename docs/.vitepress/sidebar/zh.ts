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
    ],
    "/navigation/": { base: "/navigation/", items: sidebarNavigation() },
}


function sidebarNavigation(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: "导航",
            collapsed: false,
            items: [
                { text: "php", link: "source_code/php" },
                { text: "web", link: "source_code/web" },
                { text: "运维", link: "source_code/oam" },
                { text: "UI", link: "source_code/ui" },
                { text: "工具", link: "source_code/tool" },
                { text: "娱乐", link: "source_code/audio" },
                { text: "外语", link: "source_code/foreign" },
                { text: "学习论坛", link: "source_code/learning_forum" },
            ],
        },


    ];
}