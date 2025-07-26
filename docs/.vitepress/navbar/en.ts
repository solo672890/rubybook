import {DefaultTheme} from 'vitepress'

// 中文导航
export const enNav: DefaultTheme.NavItem[] = [
    {
        text: '🍉guide',
        items: [{
            text: '',
            items: [
                {text: "theory", link: "/en/theory/whatsRubyBook", activeMatch: "/en/theory/",},
                {text: "server", link: "/en/service/linux", activeMatch: "/service/",},

            ],
        }],
    },

    {text: 'navigation', link: '/en/navigation/source_code/php'},
    {text: 'update log', link: '/en/updateLog'},
]