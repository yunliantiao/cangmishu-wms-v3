const Container = () => import(`../views/Layout/Container.vue`)
const Warehouse = () => import(`../views/Setting/Warehouse.vue`)
const Shelf = () => import(`../views/Setting/Shelf.vue`)
const Mange = () => import(`../views/Setting/Mange.vue`)
const GoodsArea = () => import(`../views/Setting/GoodsArea.vue`)
const BatchAdd = () => import(`../views/Setting/BatchAdd.vue`)
const Categories = () => import(`../views/Setting/Categories.vue`)
const PickCar = () => import(`../views/Setting/PickCar.vue`)
const List = () => import(`../views/Setting/List.vue`)
const WaveSetting = () => import(`../views/Setting/WaveSetting.vue`)
import trans from "@/i18n";

export default [
    {
        path: 'setting',
        component: Container,
        redirect: '/setting/list',
        icon: 'settings',
        meta: {
            level: 2,
            group: trans('设置'),
            name: trans('设置'),
        },
        children: [
            {
                path: 'list',
                name: 'list',
                component: List,
                id: 1001,
                meta: {
                    level: 2,
                    group: trans('设置'),
                    name: trans('设置列表'),
                },
            },
            {
                path: 'warehouse',
                name: 'warehouse',
                component: Warehouse,
                id: 1001,
                meta: {
                    level: 2,
                    icon: 'warehouse',
                    group: trans('设置'),
                    name: trans('仓库设置'),
                },
            },
            {
                path: 'shelf',
                name: 'shelf',
                component: Shelf,
                id: 1002,
                meta: {
                    level: 2,
                    icon: 'shelf',
                    group: trans('设置'),
                    name: trans('货架设置'),
                },
            },
            {
                path: 'goodsArea',
                name: 'goodsArea',
                component: GoodsArea,
                id: 1002,
                meta: {
                    level: 2,
                    icon: 'goodsArea',
                    group: trans('设置'),
                    name: trans('货区设置'),
                },
            },
            {
                path: 'mange',
                name: 'mange',
                component: Mange,
                id: 1003,
                meta: {
                    level: 2,
                    icon: 'mange',
                    group: trans('设置'),
                    name: trans('货位设置'),
                },
            },
            {
                path: 'categories',
                name: 'categories',
                component: Categories,
                id: 1002,
                meta: {
                    level: 2,
                    icon: 'categories',
                    group: trans('设置'),
                    name: trans('分类设置'),
                },
            },
            {
                path: 'pickCar',
                name: 'pickCar',
                component: PickCar,
                id: 1002,
                meta: {
                    level: 2,
                    icon: 'pickCar',
                    group: trans('设置'),
                    name: trans('拣货车设置'),
                },
            },
            {
                path: 'wave',
                name: 'wave',
                component: WaveSetting,
                id: 1001,
                meta: {
                    level: 2,
                    icon: 'wave',
                    group: trans('设置'),
                    name: trans('波次设置'),
                },
            },
            {
                path: 'batchAdd',
                name: 'batchAdd',
                component: BatchAdd,
                id: 1004,
                meta: {
                    level: 3,
                    group: trans('设置'),
                    name: trans('批量添加'),
                },
            },
        ]
    }
]