const Container = () => import(`../views/Layout/Container.vue`)
const WarehouseWarrant = () => import(`../views/Inbound/WarehouseWarrant.vue`)
const Sign = () => import(`../views/Inbound/sign.vue`)
const Receive = () => import(`../views/Inbound/receive.vue`)
const Shelve = () => import(`../views/Inbound/shelve.vue`)

export default [
    {
        path: "inbound",
        component: Container,
        redirect: "/inbound/warehouseWarrant",
        icon: "save_as",
        meta: {
            name: '入库管理',
            icon: '',
        },
        children: [
            {
                path: 'warehouseWarrant',
                name: 'warehouseWarrant',
                component: WarehouseWarrant,
                id: 1001,
                meta: {
                    level: 2,
                    group: '入库管理',
                    name: '入库管理',
                },
            },
            {
                path: 'sign',
                name: 'sign',
                component: Sign,
                id: 1001,
                meta: {
                    level: 2,
                    group: '入库管理',
                    name: '扫描签收',
                },
            },
            {
                path: 'receive',
                name: 'receive',
                component: Receive,
                id: 1001,
                meta: {
                    level: 2,
                    group: '入库管理',
                    name: '扫描收货',
                },
            },
            {
                path: 'shelve',
                name: 'shelve',
                component: Shelve,
                id: 1001,
                meta: {
                    level: 2,
                    group: '入库管理',
                    name: '扫描上架',
                },
            },
        ],
    },
]