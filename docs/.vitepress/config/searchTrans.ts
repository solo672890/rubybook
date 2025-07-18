import { defineConfig, type DefaultTheme } from "vitepress";

export const searchTrans: DefaultTheme.AlgoliaSearchOptions["locales"] = {
    root: {
        placeholder: '搜索文档',
        translations: {
            button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
            },
            modal: {
                searchBox: {
                    resetButtonTitle: '清除查询条件',
                    resetButtonAriaLabel: '清除查询条件',
                    cancelButtonText: '取消',
                    cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                    recentSearchesTitle: '搜索历史',
                    noRecentSearchesText: '没有搜索历史',
                    saveRecentSearchButtonTitle: '保存至搜索历史',
                    removeRecentSearchButtonTitle: '从搜索历史中移除',
                    favoriteSearchesTitle: '收藏',
                    removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                    titleText: '无法获取结果',
                    helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                    searchByText: '搜索提供者'
                },
                noResultsScreen: {
                    noResultsText: '无法找到相关结果',
                    suggestedQueryText: '你可以尝试查询',
                    reportMissingResultsText: '你认为该查询应该有结果？',
                    reportMissingResultsLinkText: '点击反馈'
                },
            },
        },
    },
    en: {
        placeholder: 'search for documents',
        translations: {
            button: {
                buttonText: 'search for documents',
                buttonAriaLabel: 'search for documents'
            },
            modal: {
                searchBox: {
                    resetButtonTitle: 'clear query criteria',
                    resetButtonAriaLabel: 'clear query criteria',
                    cancelButtonText: 'cancel',
                    cancelButtonAriaLabel: 'cancel'
                },
                startScreen: {
                    recentSearchesTitle: 'search history',
                    noRecentSearchesText: 'no search history',
                    saveRecentSearchButtonTitle: 'save to search history',
                    removeRecentSearchButtonTitle: 'remove from search history',
                    favoriteSearchesTitle: 'collect',
                    removeFavoriteSearchButtonTitle: 'remove from collection'
                },
                errorScreen: {
                    titleText: 'unable to obtain results',
                    helpText: 'you may need to check your network connection'
                },
                footer: {
                    selectText: 'select',
                    navigateText: 'switch',
                    closeText: 'close',
                    searchByText: 'Search Provider'
                },
                noResultsScreen: {
                    noResultsText: 'unable to find relevant results',
                    suggestedQueryText: 'you can try to search',
                    reportMissingResultsText: 'do you think the query should have results？',
                    reportMissingResultsLinkText: 'click on feedback'
                },
            },
        },
    },
};