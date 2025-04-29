const Container = () => import(`../views/Layout/Container.vue`)
const Product = () => import(`../views/Product/Product.vue`)
const ProductEdit = () => import(`../views/Product/Edit.vue`)
const TagList = () => import(`../views/Product/Tag/List.vue`)


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
                path: 'product',
                name: 'Product',
                component: Product,
                id: 1001,
                meta: {
                    level: 2,
                    group: '商品',
                    name: '商品',
                },
            },
            {
                path: 'edit/:id',
                name: 'edit',
                component: ProductEdit,
                id: 1002,
                meta: {
                    level: 3,
                    group: '商品',
                    name: '商品编辑',
                },
            },
            {
                path: 'tag/list',
                name: 'tagList',
                component: TagList,
                id: 1003,
                meta: {
                    level: 2,
                    group: '商品',
                    name: '商品标记',
                },
            }
        ]
    }
]