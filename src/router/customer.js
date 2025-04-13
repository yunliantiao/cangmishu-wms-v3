const Container = () => import(`../views/Layout/Container.vue`)

const Opened = () => import(`../views/Customer/opened.vue`)

export default [
    {
        path: 'customer',
        component: Container,
        redirect: '/customer/opened',
        icon: 'supervisor_account',
        meta: {
            name: '客户',
            icon: '',
        },
        children: [
            {
                path: 'opened',
                component: Opened,
                id: 1001,
                meta: {
                    level: 2,
                    group: '客户',
                    name: '已开户',
                },
            },
        ],
    },
]