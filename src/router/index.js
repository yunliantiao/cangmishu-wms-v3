import { createRouter, createWebHistory } from 'vue-router'
import Customer from './customer.js'
import Inbound from './inbound.js'
import Inventory from './inventory.js'
import Logistics from './logistics.js'
import Out from './out.js'
import Panel from './panel.js'
import Product from './product.js'
import Setting from './setting.js'
import Deliver from './deliver.js'

import { loadonDemand } from '@/utils/common.js'
const Layout = () => import(`../App.vue`)
const NotFound = loadonDemand('NotFound')
const Login = loadonDemand('Login')

const Sign = () => import(`../views/Inbound/Sign.vue`)


export const routerMap = []
    .concat(Panel)
    .concat(Customer)
    .concat(Product)
    .concat(Inventory)
    .concat(Inbound)
    .concat(Out)
    // .concat(Logistics)
    .concat(Deliver)
    .concat(Setting)

const constantRouterMap = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    // 扫描签收
    {
        path: '/inbound/sign',
        name: 'Sign',
        component: Sign,
    },
    // 扫描收货
    {
        path: '/inbound/receive',
        name: 'Receive',
        component: () => import('@/views/Inbound/Receive.vue'),
    },
    // 扫描上架
    {
        path: '/inbound/shelve',
        name: 'Shelve',
        component: () => import('@/views/Inbound/Shelve.vue'),
    },
    // 扫描出库
    {
        path: '/scan/wave',
        name: 'ScanWave',
        component: () => import('@/views/Out/Wave/SortOut.vue'),
    },
    // 扫描包装
    {
        path: '/scan/packing',
        name: 'ScanPacking',
        component: () => import('@/views/Out/Wave/ScanPacking.vue'),
    },
    // 扫描验货
    {
        path: '/examine/goods',
        name: 'ExamineGoods',
        component: () => import('@/views/Deliver/ExamineGoods.vue'),
    },
    {
        path: '/Test',
        name: 'Test',
        component: () => import('@/views/Test.vue'),
    },
    {
        path: '/partner/login',
        name: 'PartnerLogin',
        component: () => import('@/views/Partner/Login.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
    {
        path: '/',
        name: 'main',
        redirect: '/home/panel',
        component: Layout,
        children: routerMap,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRouterMap,
})
// router.beforeEach(router)
export default router
