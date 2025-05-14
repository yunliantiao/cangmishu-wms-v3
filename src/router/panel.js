const Container = () => import(`../views/Layout/Container.vue`)
const Panel = () => import(`../views/Home/Panel.vue`)
import trans from "@/i18n";

export default [
    {
        path: 'home',
        redirect: '/home/panel',
        component: Container,
        icon: 'home',
        meta: {
            name: trans('首页'),
            icon: '',
        },
        children: [
            {
                path: 'panel',
                name: 'Panel',
                component: Panel,
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('首页'),
                    name: trans('控制面板'),
                },
            },
        ]
    }
]

