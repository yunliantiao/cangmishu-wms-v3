const Container = () => import(`../views/Layout/Container.vue`)
const Warehouse = () => import(`../views/Setting/Warehouse.vue`)
const Shelf = () => import(`../views/Setting/Shelf.vue`)
const Mange = () => import(`../views/Setting/Mange.vue`)
const GoodsArea = () => import(`../views/Setting/GoodsArea.vue`)
const BatchAdd = () => import(`../views/Setting/BatchAdd.vue`)
const Categories = () => import(`../views/Setting/Categories.vue`)

export default [
    {
        path: 'setting',
        component: Container,
        redirect: '/setting/warehouse',
        icon: 'settings',
        meta: {
            level: 2,
            group: '设置',
            name: '设置',
        },
        children: [
            {
                path: 'warehouse',
                name: 'warehouse',
                component: Warehouse,
                id: 1001,
                meta: {
                    level: 2,
                    group: '设置',
                    name: '仓库设置',
                },
            },
            {
                path: 'categories',
                name: 'categories',
                component: Categories,
                id: 1002,
                meta: {
                    level: 2,
                    group: '设置',
                    name: '分类设置',
                },
            },
            {
                path: 'goodsArea',
                name: 'goodsArea',
                component: GoodsArea,
                id: 1002,
                meta: {
                    level: 2,
                    group: '设置',
                    name: '货区设置',
                },
            },
            {
                path: 'shelf',
                name: 'shelf',
                component: Shelf,
                id: 1002,
                meta: {
                    level: 2,
                    group: '设置',
                    name: '货架设置',
                },
            },
            {
                path: 'mange',
                name: 'mange',
                component: Mange,
                id: 1003,
                meta: {
                    level: 2,
                    group: '设置',
                    name: '货位设置',
                },
            },
            {
                path: 'batchAdd',
                name: 'batchAdd',
                component: BatchAdd,
                id: 1004,
                meta: {
                    level: 3,
                    group: '设置',
                    name: '批量添加',
                },
            },
        ]
    }
]