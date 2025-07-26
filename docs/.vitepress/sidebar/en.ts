import { DefaultTheme } from 'vitepress'
export const enSidebar: DefaultTheme.Sidebar = {
    "/en/theory/": { base: "/en/theory/", items: theoryService() },
    "/service/": { base: "/service/", items: sidebarService() },
    "/navigation/": { base: "/navigation/", items: sidebarNavigation() },
}

function theoryService() :DefaultTheme.SidebarItem[] {
    return [
        {
            text: "theory",
            collapsed: false,
            items: [
                { text: "whats the RubyBook", link: "/whatsRubyBook" },
                { text: "redis", link: "redis" },
                // { text: "问答社区", link: "help" },
            ],
        },
    ];
}
function sidebarService() :DefaultTheme.SidebarItem[] {
    return [
        {
            text: "server",
            collapsed: false,
            items: [
                { text: "Linux", link: "linux" },
                { text: "redis", link: "redis" },
                // { text: "问答社区", link: "help" },
            ],
        },
        {
            text: "quick start",
            collapsed: false,
            items: [
                { text: "install", link: "install" },
                { text: "directory structure", link: "directory" },
                { text: "simple example", link: "tutorial" },
            ],
        },

    ];
}
function sidebarNavigation(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: "Navigation",
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