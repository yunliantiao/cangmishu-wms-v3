const Container = () => import(`../views/Layout/Container.vue`)
const WarehouseWarrant = () => import(`../views/Inbound/WarehouseWarrant.vue`)
// const Sign = () => import(`../views/Inbound/sign.vue`)
// const Receive = () => import(`../views/Inbound/receive.vue`)
const Shelve = () => import(`../views/Inbound/shelve.vue`)
import trans from "@/i18n";

export default [
    {
        path: "inbound",
        component: Container,
        redirect: "/inbound/warehouseWarrant",
        icon: "save_as",
        meta: {
            name: trans('入库管理'),
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
                    group: trans('入库管理'),
                    name: trans('入库管理'),
                },
            },

            {
                path: 'sign2',
                name: 'sign2',
                redirect: '/inbound/sign',
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('入库管理'),
                    name: trans('扫描签收'),
                },
            },
            {
                path: 'receive',
                name: 'receive',
                id: 1001,
                redirect: '/inbound/receive',
                meta: {
                    level: 2,
                    group: trans('入库管理'),
                    name: trans('扫描收货'),
                },
            },
            {
                path: 'shelve',
                name: 'shelve',
                component: Shelve,
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('入库管理'),
                    name: trans('扫描上架'),
                },
            },
        ],
    },
]