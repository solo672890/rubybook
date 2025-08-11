import { DefaultTheme } from 'vitepress'
export const zhSidebar: DefaultTheme.Sidebar = {
    "/theory/": { base: "/theory/", items: theoryService() },
    "/service/": { base: "/service/", items: sidebarService() },
    "/web/": { base: "/web/", items: webNavigation() },
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
                { text: "如何设计每天一亿订单的订单系统?", link: "order_framework_design" },
                { text: "如何设计每天20万订单的c2c系统?", link: "order1_framework_design" },
                { text: "分表后,客户端不按月份翻页", link: "order2_framework_design" },
                { text: "如何在团队里使用git?", link: "how_to_use_git" },

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
                { text: "mysql", link: "mysql" },
                { text: "nginx", link: "nginx" },
            ],
        },
        {
            text: "语言",
            collapsed: false,
            items: [
                { text: "php", link: "php" },
                { text: "go", link: "go" },

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

function webNavigation(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: "web端",
            collapsed: false,
            items: [
                { text: "node", link: "node" },

            ],
        },


    ];
}