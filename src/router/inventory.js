const Container = () => import(`../views/Layout/Container.vue`)
const InventoryList = () => import(`../views/Inventory/InventoryList.vue`)
const Move = () => import(`../views/Inventory/Move.vue`)
const CreateMove = () => import(`../views/Inventory/CreateMove.vue`)
const Adjust = () => import(`../views/Inventory/Adjust.vue`)
const CreateAdjust = () => import(`../views/Inventory/CreateAdjust.vue`)
const Count = () => import(`../views/Inventory/Count.vue`)
const CreateCount = () => import(`../views/Inventory/CreateCount.vue`)
const Stocktaking = () => import(`../views/Inventory/Stocktaking.vue`)
import trans from "@/i18n";

export default [
    {
        path: 'inventory',
        component: Container,
        redirect: '/inventory/inventory-list',
        icon: 'inventory',
        meta: {
            name: trans('库存管理'),
        },
        children: [
            {
                path: 'inventory-list',
                component: InventoryList,
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('库存管理'),
                    name: trans('库存列表'),
                },
            },
            {
                path: 'move',
                component: Move,
                id: 1002,
                meta: {
                    level: 2,
                    group: trans('库存管理'),
                    name: trans('库内移货'),
                },
            },
            {
                path: 'create-move',
                name: 'create-move',
                component: CreateMove,
                id: 1003,
                meta: {
                    level: 3,
                    group: trans('库存管理'),
                    name: trans('创建移货单'),
                },
            },
            {
                path: 'adjust',
                component: Adjust,
                id: 1004,
                meta: {
                    level: 2,
                    group: trans('库存管理'),
                    name: trans('库存调整'),
                },
            },
            {
                path: 'create-adjust',
                name: 'create-adjust',
                component: CreateAdjust,
                // redirect: '/adjust/create',
                id: 1005,
                is_self: true,
                meta: {
                    level: 3,
                    group: trans('库存管理'),
                    name: trans('创建调整单'),
                },
            },
            {
                path: 'count',
                name: 'count',
                component: Count,
                id: 1006,
                meta: {
                    level: 2,
                    group: trans('库存管理'),
                    name: trans('库存盘点'),
                },
            },
            {
                path: 'create-count',
                name: 'create-count',
                component: CreateCount,
                id: 1007,
                meta: {
                    level: 3,
                    group: trans('库存管理'),
                    name: trans('创建盘点单'),
                },
            },
            {
                path: 'stocktaking',
                name: 'stocktaking',
                component: Stocktaking,
                id: 1008,
                meta: {
                    level: 3,
                    group: trans('库存管理'),
                    name: trans('盘点'),
                },
            },
        ]
    }
]