const Container = () => import(`../views/Layout/Container.vue`)

const Opened = () => import(`../views/Customer/opened.vue`)
import trans from "@/i18n";

export default [
    {
        path: 'customer',
        component: Container,
        redirect: '/customer/opened',
        icon: 'supervisor_account',
        meta: {
            name: trans('客户'),
            icon: '',
        },
        children: [
            {
                path: 'opened',
                component: Opened,
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('客户'),
                    name: trans('已开户'),
                },
            },
        ],
    },
]