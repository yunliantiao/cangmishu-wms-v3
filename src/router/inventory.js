const Container = () => import(`../views/Layout/Container.vue`)
const InventoryList = () => import(`../views/Inventory/InventoryList.vue`)

export default [
    {
        path: 'inventory',
        component: Container,
        redirect: '/inventory/inventory-list',
        icon: 'inventory',
        meta: {
            name: '库存管理',
        },
        children: [
            {
                path: 'inventory-list',
                component: InventoryList,
                id: 1001,
                meta: {
                    level: 2,
                    group: '库存管理',
                    name: '库存列表',
                },
            }
        ]
    }
]