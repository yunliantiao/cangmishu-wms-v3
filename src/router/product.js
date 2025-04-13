const Container = () => import(`../views/Layout/Container.vue`)
const Product = () => import(`../views/Product/Product.vue`)

export default [
    {
        path: 'product',
        redirect: '/product/product',
        component: Container,
        icon: 'article',
        meta: {
            name: '商品',
            icon: '',
        },
        children: [
            {
                path: 'Product',
                name: 'Product',
                component: Product,
                id: 1001,
                meta: {
                    level: 2,
                    group: '商品',
                    name: '商品',
                },
            }
        ]
    }
]