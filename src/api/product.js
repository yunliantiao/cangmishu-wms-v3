//商品接口
import { GET, POST, PUT, PATCH, DEL } from "./config";
export default {
    getSkuList: (data) => GET("skus", data), // 获取SKU列表
    getProductList: (data) => GET("products", data), // 获取商品列表
    getProduct: (id) => GET(`products/${id}`), // 获取商品详情
    updateProduct: (id, data) => PUT(`products/${id}`, data), // 更新商品
    customsTypes: () => GET("customs-types"), // 商品报关属性列表
    printSku: (data) => POST("products/labels/generate", data), // 打印 SKU 标签
}