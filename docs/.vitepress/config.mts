import { defineConfig } from 'vitepress'
import { sharedConfig } from './config/share'
import { zhConfig } from './config/zh'
import { enConfig } from './config/en'
import markdownItTaskCheckbox from 'markdown-it-task-checkbox'
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons'
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import { AnnouncementPlugin } from 'vitepress-plugin-announcement'
const mode = process.env.NODE_ENV || 'development'
const { VITE_BASE_URL,VITE_GITHUB_URL } = loadEnv(mode, process.cwd())
import timeline from "vitepress-markdown-timeline";
import { usePosts } from './theme/untils/permalink';
import {loadEnv} from "vite";
const { rewrites } = await usePosts();


export default defineConfig({
  lang: 'zh-CN',
  rewrites,
  ...sharedConfig,
  locales: { // 多语言
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      ...zhConfig
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      ...enConfig
    }
  },
  // #region fav
  head: [
    ['link', { rel: 'icon', href: '/rubybook/logo.png' }],
    // 网页视口
    ['meta', { name: "viewport", content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no,shrink-to-fit=no" }],
    // 关键词和描述
    ['meta', { name: "keywords", content: "中小型IT项目指南" }],
    ['meta', { name: "keywords", content: "Guidelines for Small and Medium sized IT Projects" }],
    ['meta', { name: "algolia-site-verification", content: "24EA7AEE7DDC6BAB" }],

  ],
  // #endregion fav
  sitemap: {
    hostname: VITE_GITHUB_URL,
  },
  base: VITE_BASE_URL, //网站部署到github的vitepress这个仓库里
  // cleanUrls:true, //开启纯净链接无html
  //启用深色模式
  appearance: 'dark',
  //markdown配置
  markdown: {
    //行号显示
    lineNumbers: true,
    // toc显示一级标题
    toc: {level: [1,2,3]},
    // 使用 `!!code` 防止转换
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, '[!code')
        }
      }
    ],

    // 开启图片懒加载
    image: {
      lazyLoading: true
    },

    config: (md) => {
      // 组件插入h1标题下
      md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
        let htmlResult = slf.renderToken(tokens, idx, options)
        if (tokens[idx].tag === 'h1') htmlResult += `<ArticleMetadata />`
        return htmlResult
      },

      // 代码组中添加图片
      md.use((md) => {
        md.use(timeline);
        const defaultRender = md.render
        md.render = (...args) => {
          const [content, env] = args
          const currentLang = env?.localeIndex || 'root'
          const isHomePage = env?.path === '/' || env?.relativePath === 'index.md'  // 判断是否是首页

          if (isHomePage) {
            return defaultRender.apply(md, args) // 如果是首页，直接渲染内容
          }
          // 调用原始渲染
          let defaultContent = defaultRender.apply(md, args)
          // 替换内容
          if (currentLang === 'root') {
            defaultContent = defaultContent.replace(/NOTE/g, '提醒')
              .replace(/TIP/g, '建议')
              .replace(/IMPORTANT/g, '重要')
              .replace(/WARNING/g, '警告')
              .replace(/CAUTION/g, '注意')
          } else if (currentLang === 'ko') {
            // 韩文替换
            defaultContent = defaultContent.replace(/NOTE/g, '알림')
              .replace(/TIP/g, '팁')
              .replace(/IMPORTANT/g, '중요')
              .replace(/WARNING/g, '경고')
              .replace(/CAUTION/g, '주의')
          }
          // 返回渲染的内容
          return defaultContent
        }

        // 获取原始的 fence 渲染规则
        const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules) ?? ((...args) => args[0][args[1]].content);

        // 重写 fence 渲染规则
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const token = tokens[idx];
          const info = token.info.trim();

          // 判断是否为 md:img 类型的代码块
          if (info.includes('md:img')) {
            // 只渲染图片，不再渲染为代码块
            return `<div class="rendered-md">${md.render(token.content)}</div>`;
          }

          // 其他代码块按默认规则渲染（如 java, js 等）
          return defaultFence(tokens, idx, options, env, self);
        };
      })
      
      md.use(groupIconMdPlugin) //代码组图标
      md.use(markdownItTaskCheckbox) //todo
      md.use(MermaidMarkdown); 

    }

  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          ts: localIconLoader(import.meta.url, '../public/svg/typescript.svg'), //本地ts图标导入
          md: localIconLoader(import.meta.url, '../public/svg/md.svg'), //markdown图标
          css: localIconLoader(import.meta.url, '../public/svg/css.svg'), //css图标
          js: 'logos:javascript', //js图标
        },
      }),
      AnnouncementPlugin({
        title: 'contact info | 联系方式',

        closeIcon:"<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"><svg t=\"1754058159930\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"7292\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"32\" height=\"32\"><path d=\"M512 64C264.9 64 64 264.9 64 512s200.9 448 448 448 448-200.9 448-448S759.1 64 512 64z m181 583.5l-45.3 45.3L512 556.9 376.2 692.7 331 647.5l135.8-135.8L331 375.9l45.3-45.3L512 466.4l135.8-135.8 45.3 45.3-135.8 135.8L693 647.5z\" fill=\"#f0cf1d\" p-id=\"7293\"></path></svg>",
        body: [
          { type: 'text', content: 'telegram' },
          {
            type: 'image',
            src: VITE_BASE_URL+'tg_info.png',
            style: 'display: inline-block;width:46%;padding-right:6px'
          },
        ],
        footer: [
          {
            type: 'text',
            content: 'solo672890@gmail.com'
          },
          {
            type: 'button',
            content: 'About Me',
            link: VITE_BASE_URL+'aboutMe',
            props: {
              type: 'success'
            }
          },
        ],
      }),
      [MermaidPlugin()]
    ]as any,
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
  },

  lastUpdated: true, //此配置不会立即生效，需git提交后爬取时间戳，没有安装git本地报错可以先注释


})

