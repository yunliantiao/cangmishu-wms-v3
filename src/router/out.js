const Container = () => import(`../views/Layout/Container.vue`)
const Simple = () => import(`../views/Out/Simple.vue`)
const OutboundOrder = () => import(`../views/Out/OutboundOrder.vue`)

export default [
    {
        path: 'out',
        component: Container,
        redirect: '/out/simple',
        icon: 'print',
        meta: {
            name: '出库管理',
            icon: '',
        },
        children: [
            {
                path: 'simple',
                name: 'simple',
                component: Simple,
                id: 1001,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '简易打单',
                },
            },
            {
                path: 'parcel',
                name: 'parcel',
                component: OutboundOrder,
                id: 1002,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '全部订单',
                },
            }
        ]
    }
]