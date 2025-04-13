//商品接口
import { GET, POST, PUT, PATCH, DEL } from "./config";
export default {
    getSkuList: (data) => GET("skus", data), // 获取SKU列表
    getProductList: (data) => GET("products", data), // 获取商品列表
}