import { defineConfig } from 'vitepress'

import {searchTrans} from './searchTrans'
import {loadEnv} from "vite";
const mode = process.env.NODE_ENV || 'development'
const { VITE_GITHUB_URL } = loadEnv(mode, process.cwd())


export const sharedConfig = defineConfig({
    rewrites: { // 很重要，
        'zh/:rest*': ':rest*',
    },
    metaChunk: true,
    lang: 'zh-CN', // 语言
    title: "RubyBook", // 站点名称
    // titleTemplate: "中小型IT项目指南a", // 网页标题<title>,可以通过frontmatter 覆盖
    description: "中小型IT项目指南 | 结构化、体系化的技术知识内容分享与创作", // 站点描述meta 可以通过frontmatter 覆盖

    lastUpdated: true, // 上次更新
    vite: {
        build: {
            chunkSizeWarningLimit: 1600
        },
        plugins: [],
        server: {
            port: 18089
        }
    },
    //主题配置
    themeConfig: {
        //左上角logo
        logo: '/logo.png',
        //siteTitle: false, //标题隐藏

        //设置站点标题 会覆盖title
        //siteTitle: 'Hello World',


        //社交链接
        socialLinks: [
            { icon: 'github', link: VITE_GITHUB_URL },

        ],
        //手机端深浅模式文字修改
        darkModeSwitchLabel: '深浅模式',

        //页脚
        footer: {
            message: 'Released under the MIT License.',
            copyright: `Copyright © 2023-${new Date().getFullYear()} `,
        },

        //侧边栏文字更改(移动端)
        // sidebarMenuLabel: '目录',
        //返回顶部文字修改(移动端)
        returnToTopLabel: '返回顶部',

        //大纲显示2-3级标题
        outline: {
            level: [2, 3],
            label: '当前页大纲'
        },

        //自定义上下页名
        docFooter: {
            prev: '上一页',
            next: '下一页',
        },

        //Algolia搜索
        // search: {
        //   provider: "local",
        // },
        search: {
            provider: 'algolia',
            options: {
                appId: 'QVKQI62L15',
                apiKey: 'bef8783dde57293ce082c531aa7c7e0c',
                indexName: 'doc',
                locales: {
                    searchTrans
                },
            },
        },



    },
})