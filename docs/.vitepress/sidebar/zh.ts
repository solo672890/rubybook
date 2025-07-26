import { DefaultTheme } from 'vitepress'
export const zhSidebar: DefaultTheme.Sidebar = {
    "/theory/": { base: "/theory/", items: theoryService() },
    "/service/": { base: "/service/", items: sidebarService() },
    "/navigation/": { base: "/navigation/", items: sidebarNavigation() },
}

function theoryService() :DefaultTheme.SidebarItem[] {
    return [
        {
            text: "理论",
            collapsed: false,
            items: [
                { text: "RubyBook是什么", link: "whatsRubyBook" },
                { text: "中小型it项目技术选型", link: "technical_selection" },
                // { text: "问答社区", link: "help" },
            ],
        },
    ];
}
function sidebarService() :DefaultTheme.SidebarItem[] {
    return [
        {
            text: "服务端",
            collapsed: false,
            items: [
                { text: "Linux", link: "linux" },
                { text: "redis", link: "redis" },
                // { text: "问答社区", link: "help" },
            ],
        },
        {
            text: "快速开始",
            collapsed: false,
            items: [
                { text: "安装", link: "install" },
                { text: "目录结构", link: "directory" },
                { text: "简单示例", link: "tutorial" },
            ],
        },

    ];
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