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
            text: "源码",
            collapsed: false,
            items: [
                { text: "php", link: "navigation/source_code/php" },
                { text: "uniapp", link: "getting-started/simple-example" },
            ],
        },
        {
            text: "安装",
            collapsed: false,
            items: [
                { text: "环境要求", link: "install/requirement" },
                { text: "下载安装", link: "install/install" },
                { text: "启动停止", link: "install/start-and-stop" },
            ],
        },
        {
            text: "开发流程",
            collapsed: false,
            items: [
                { text: "开发前必读", link: "development/before-development" },
                { text: "目录结构", link: "development/directory-structure" },
                { text: "开发规范", link: "development/standard" },
                { text: "基本流程", link: "development/process" },
            ],
        },
        {
            text: "通讯协议",
            collapsed: false,
            items: [
                { text: "通讯协议作用", link: "protocols/why-protocols" },
                { text: "定制通讯协议", link: "protocols/how-protocols" },
                { text: "一些例子", link: "protocols/example" },
            ],
        },

    ];
}