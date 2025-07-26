import {DefaultTheme} from 'vitepress'

// 中文导航
export const zhNav: DefaultTheme.NavItem[] = [
{
    text: '🍉指南',
    items: [{
        text: '',
        items: [
            {text: "理论", link: "/theory/whatsRubyBook", activeMatch: "/theory/",},
            {text: "服务端", link: "/service/linux", activeMatch: "/service/",},

        ],
    }],
},

    {text: '导航', link: '/navigation/source_code/php'},
    {text: '更新日志', link: '/updateLog'},
]