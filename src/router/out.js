const Container = () => import(`../views/Layout/Container.vue`)
const Simple = () => import(`../views/Out/Simple.vue`)
const OutboundOrder = () => import(`../views/Out/OutboundOrder.vue`)
const Wave = () => import(`../views/Out/Wave/Index.vue`)
const WaveList = () => import(`../views/Out/Wave/List.vue`)
const WaveInfo = () => import(`../views/Out/Wave/Info.vue`)
const SortOut = () => import(`../views/Out/Wave/SortOut.vue`)
const Pigeonholes = () => import(`../views/Out/Wave/Pigeonholes.vue`)
const Packaging = () => import(`../views/Out/Wave/Packaging.vue`)
const ScanPacking = () => import(`../views/Out/Wave/ScanPacking.vue`)

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
            },
            {
                path: 'wave',
                name: 'wave',
                component: Wave,
                id: 1003,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '生成波次',
                },
            },
            {
                path: 'wave/list',
                name: 'waveList',
                component: WaveList,
                id: 1004,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '波次列表',
                },
            },
            {
                path: 'wave/sort/out',
                name: 'SortOut',
                component: SortOut,
                id: 1005,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '扫描分拣',
                },
            },
            {
                path: 'wave/scan/packing',
                name: 'ScanPacking',
                component: ScanPacking,
                id: 1009,
                meta: {
                    level: 2,
                    group: '出库管理',
                    name: '扫描包装',
                },
            },
            {
                path: 'wave/info',
                name: 'waveInfo',
                component: WaveInfo,
                id: 1006,
                meta: {
                    level: 3,
                    group: '出库管理',
                    name: '波次详情',
                },
            },
            {
                path: 'wave/pigeonholes',
                name: 'pigeonholes',
                component: Pigeonholes,
                id: 1007,
                meta: {
                    level: 3,
                    group: '出库管理',
                    name: '分拣台',
                },
            },
            {
                path: 'wave/packaging',
                name: 'Packaging',
                component: Packaging,
                id: 1008,
                meta: {
                    level: 3,
                    group: '出库管理',
                    name: '扫描包装',
                },
            },

        ]
    }
]