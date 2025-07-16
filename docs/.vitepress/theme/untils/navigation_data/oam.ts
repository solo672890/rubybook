import type { NavData } from '../types'

export const OAM_DATA: NavData[] = [
    {
        title: '教程',
        items: [
            {
                icon: '/icons/docker.png',
                title: 'Docker-从入门到实践',
                desc: '看云广场也有该文档',
                badge: {
                    text: '文档',
                    type: 'danger',
                },
                link: 'https://vuepress.mirror.docker-practice.com/'
            },
        ]
    }

]



