import { createRouter, createWebHistory } from 'vue-router'
import Panel from './panel.js'
import Product from './product.js'
import Customer from './customer.js'
import Out from './out.js'
import Inventory from './inventory.js'
import Inbound from './inbound.js'
import Setting from './setting.js'

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
    .concat(Setting)

const constantRouterMap = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
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
