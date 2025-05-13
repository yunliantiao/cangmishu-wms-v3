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
